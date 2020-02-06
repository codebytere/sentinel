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
      required: ['version', 'install'],
      properties: {
        version: { type: 'string' },
        install: { type: 'string' }
      }
    }
  },
  handler: async (request, reply) => {
    const { install, version } = request.body
    const req = await mRequest.CreateNew({
      install_url: install,
      version
    })

    const registrants = await mRegistrant.FindAll()

    for (let reg of registrants) {
      console.log(reg)
      const fb = await mFeedback.NewFromRequest(req, reg)
      const report_callback = `http://localhost:${PORT}/report/${fb.table.id}`

      const feedback_request = {
        install,
        version,
        report_callback
      } as api.FeedbackRequest

      const resp = await fetch(reg.table.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedback_request)
      })

      const {
        expect_reports,
        session_token
      } = (await resp.json()) as api.FeedbackRequestResponse

      if (!session_token) {
        throw new Error('No session token found')
      }

      fb.table.expect_reports = expect_reports
      fb.table.session_token = session_token

      await fb.table.save()
    }
    reply.code(200)
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
  handler: async request => {
    const { feedback_id } = request.params
    const fb = await mFeedback.FindById(feedback_id)
    const report: api.Report = request.body
    // TODO: validate report information
    const {
      table: { id }
    } = await mReport.NewFromFeedback(fb, report)

    return { test_callback: `http://localhost:${PORT}/test/${id}` }
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
    },
  },
  handler: async (request, reply)=> {
    const { report_id } = request.params
    const report = await mReport.FindById(report_id)
    const test: api.TestData = request.body

    // TODO: validate test information
    await mTestData.NewFromReport(report, test)
    reply.code(200)
  }
})

fastify.get('/ping', (_request, reply) => {
  reply.code(200).send({ pong: 'success!' })
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
