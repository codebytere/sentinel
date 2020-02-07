import * as fast from 'fastify'
import fetch from 'node-fetch'

import { api } from './api'
import { Tables } from './models'
import {
  mRegistrant,
  mRequest,
  mFeedback,
  mReport,
  mTestData
} from './database'

const { PORT = '3000' } = process.env
const fastify = fast({ logger: true })

fastify.route({
  method: 'POST',
  url: '/trigger',
  schema: {
    body: {
      type: 'object',
      required: ['version', 'install_data'],
      properties: {
        commit_hash: { type: 'string' },
        version_qualifier: { type: 'string' },
        install_data: {
          type: 'object',
          required: ['platform', 'link'],
          properties: {
            platform: { type: 'string' },
            link: { type: 'string' }
          }
        }
      }
    }
  },
  handler: async (request, reply) => {
    const { install_data, version_qualifier, commit_hash } = request.body

    try {
      const req = await mRequest.FindOrCreate({
        commit_hash,
        version_qualifier
      })

      // Update platform install data with the platform/link that was passed.
      const { platform, link } = install_data
      req.table.platform_install_data[platform] = link
      await req.table.save()

      // Fetch all current service registrants
      const registrants = await mRegistrant.FindAll()

      // Fan out webhook to each registered AFP feedback user
      // with the new platform dist zip and feedback link.
      for (let reg of registrants) {
        const fb = await mFeedback.NewFromRequest(req, reg)
        const report_callback = `http://localhost:${PORT}/report/${fb.table.id}`

        const feedback_request = {
          install_data,
          version_qualifier,
          report_callback,
          commit_hash
        } as api.FeedbackRequest

        // Fetch back expectation data and session token from a registrant
        const resp = await fetch(reg.table.webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(feedback_request)
        })

        // Destructure registrant feedback request response.
        const {
          expect_reports,
          session_token
        } = (await resp.json()) as api.FeedbackRequestResponse

        if (!session_token) {
          throw new Error('No session token found')
        }

        // Update expectation data for this per-registrant Feedback instance.
        fb.table.expect_reports = expect_reports
        fb.table.session_token = session_token
        await fb.table.save()
      }

      reply
        .code(200)
        .send(`Sent updated webhooks for ${platform} on ${commit_hash}`)
    } catch (err) {
      reply.code(500).send(err)
    }
  }
})

fastify.route({
  method: 'POST',
  url: '/report/:feedback_id',
  schema: {
    params: {
      type: 'object',
      required: ['feedback_id'],
      properties: {
        feedback_id: { type: 'number' }
      }
    },
    response: {
      '2xx': {
        type: 'object',
        properties: {
          test_callback: { type: 'string', format: 'uri' }
        }
      }
    }
  },
  handler: async (request, reply) => {
    const { feedback_id } = request.params

    try {
      // Find feedback created at the trigger stage for this Registrant.
      const fb = await mFeedback.FindById(feedback_id)
      const report: api.Report = request.body

      // Create new Report instance from this Feedback.
      const {
        table: { id }
      } = await mReport.NewFromFeedback(fb, report)

      // Tell the Registrant where to post their granular test run data.
      reply.send({ test_callback: `http://localhost:${PORT}/test/${id}` })
    } catch (err) {
      reply.send(err)
    }
  }
})

fastify.route({
  method: 'POST',
  url: '/test/:report_id',
  schema: {
    params: {
      type: 'object',
      required: ['report_id'],
      properties: {
        report_id: { type: 'number' }
      }
    }
  },
  handler: async (request, reply) => {
    const { report_id } = request.params

    try {
      const report = await mReport.FindById(report_id)
      const test: api.TestData = request.body

      // TODO: validate test information
      await mTestData.NewFromReport(report, test)

      reply.code(200)
    } catch (err) {
      reply.send(err)
    }
  }
})

fastify.get('/ping', async (_request, reply) => {
  try {
    const r = await mRegistrant.Create({
      name: 'John',
      webhook: 'https://webhook.site/#!/ca655e2f-0fd8-4dc3-8f72-ab237b9d5af4'
    })
    await r.table.save()
    reply.code(200).send({ success: 'Created new Registrant' })
  } catch (err) {
    reply.code(500).send(err)
  }
})

const start = async () => {
  try {
    await Tables.sync()
    await fastify.listen(PORT)
    fastify.log.info(`server listening on ${PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
