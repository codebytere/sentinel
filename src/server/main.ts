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

const PORT = ((process.env.PORT as unknown) as number) || 3000
const { HOST = '0.0.0.0' } = process.env

// Valid platforms where CI may be run.
const platforms = [
  'win32-ia32',
  'win32-x64',
  'win32-arm64',
  'win32-arm64-x64',
  'darwin-x64',
  'mas-x64',
  'linux-armv7l',
  'linux-arm64'
]

const fastify = fast({ logger: true })

fastify.get('/', (_req, reply) => {
  reply.code(200).send('Welcome to Sentinel!')
})

fastify.route({
  method: 'POST',
  url: '/trigger',
  schema: {
    body: {
      type: 'object',
      required: ['version', 'install_data'],
      properties: {
        commitHash: { type: 'string' },
        versionQualifier: { type: 'string' },
        platformInstallData: {
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
    const { platformInstallData, versionQualifier, commitHash } = request.body

    try {
      const req = await mRequest.FindOrCreate({
        commitHash,
        versionQualifier
      })

      // Update platform install data with the platform/link that was passed.
      const { platform, link } = platformInstallData
      req.table.platformInstallData[platform] = link
      await req.table.save()

      // Fetch all current service registrants
      const registrants = await mRegistrant.FindAll()

      // Fan out webhook to each registered AFP feedback user
      // with the new platform dist zip and feedback link.
      for (let reg of registrants) {
        const fb = await mFeedback.NewFromRequest(req, reg)
        const reportCallback = `http://localhost:${PORT}/report/${fb.table.id}`

        const feedbackRequest = {
          platformInstallData,
          versionQualifier,
          reportCallback,
          commitHash
        } as api.FeedbackRequest

        // Fetch back expectation data and session token from a registrant
        if (!platforms.includes(platform)) {
          throw new Error(`Invalid platform: ${platform}`)
        }

        // Check that the registrant has registered for this platform-specific webhook.
        const platformWebhook = reg.table.webhook[platform]
        if (!platformWebhook) {
          console.log(
            `${reg.table.name} is not registered for platform: ${platform}`
          )
          continue
        }

        const resp = await fetch(platformWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(feedbackRequest)
        })

        // Destructure registrant feedback request response.
        const {
          expectReports,
          sessionToken
        } = (await resp.json()) as api.FeedbackRequestResponse

        // Ensure that requisite data has been sent back by the registrant.
        if (!sessionToken) {
          throw new Error('No session token found')
        } else if (!expectReports) {
          throw new Error(
            'Invalid report expectation value: must be true or false.'
          )
        }

        // Update expectation data for this per-registrant Feedback instance.
        fb.table.expectReports = expectReports
        fb.table.sessionToken = sessionToken
        await fb.table.save()
      }

      reply
        .code(200)
        .send(`Sent updated webhooks for ${platform} on ${commitHash}`)
    } catch (err) {
      reply.code(500).send(err)
    }
  }
})

fastify.route({
  method: 'POST',
  url: '/report/:feedbackId',
  schema: {
    params: {
      type: 'object',
      required: ['feedbackId'],
      properties: {
        feedback_id: { type: 'number' }
      }
    },
    body: {
      type: 'object',
      required: ['name', 'effectRequest', 'testAgent'],
      properties: {
        name: { type: 'string' },
        status: { type: api.Status },
        arch: { type: api.Arch },
        os: { type: api.OS },
        effectRequest: { type: api.CIEffectRequest },
        testAgent: { type: 'object' }
      }
    },
    response: {
      '2xx': {
        type: 'object',
        properties: {
          testCallback: { type: 'string', format: 'uri' }
        }
      }
    }
  },
  handler: async (request, reply) => {
    const { feedbackId } = request.params

    try {
      // Find feedback created at the trigger stage for this Registrant.
      const fb = await mFeedback.FindById(feedbackId)
      const report: api.Report = request.body

      // Create new Report instance from this Feedback.
      const {
        table: { id }
      } = await mReport.NewFromFeedback(fb, report)

      // Tell the Registrant where to post their granular test run data.
      reply
        .code(200)
        .send({ testCallback: `http://localhost:${PORT}/test/${id}` })
    } catch (err) {
      reply.code(500).send(err)
    }
  }
})

fastify.route({
  method: 'POST',
  url: '/test/:reportId',
  schema: {
    params: {
      type: 'object',
      required: ['reportId'],
      properties: {
        reportId: { type: 'number' }
      }
    },
    body: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        reportId: { type: 'number' },
        sourceLink: { type: 'string' },
        datetimeStart: { type: Date },
        datetimeStop: { type: Date },
        totalReady: { type: 'number' },
        totalPassed: { type: 'number' },
        totalSkipped: { type: 'number' },
        totalAborted: { type: 'number' },
        totalWarnings: { type: 'number' },
        totalFailed: { type: 'number' },
        workspaceGzipLink: { type: 'string' },
        logfileLink: { type: 'string' }
      }
    }
  },
  handler: async (request, reply) => {
    const { reportId } = request.params

    try {
      // Find Report generated by the Feedback.
      const report = await mReport.FindById(reportId)
      const test: api.TestData = request.body

      // Create new TestData from the information in the request body.
      await mTestData.NewFromReport(report, test)

      reply.code(200).send('TestData successfully created')
    } catch (err) {
      reply.code(500).send(err)
    }
  }
})

const start = async () => {
  try {
    await Tables.sync()
    await fastify.listen({ port: PORT, host: HOST })
    fastify.log.info(`server listening on ${PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

let id = 0
const getNextID = () => ++id

// Temp helper function to seed data.
fastify.get('/ping', async (_request, reply) => {
  try {
    const reg = await mRegistrant.Create({
      name: `Sally${getNextID()}`,
      webhook: 'https://my-cool-webhook.com'
    })
    await reg.table.save()
    reply.code(200).send({ registrant: reg })
  } catch (err) {
    reply.code(500).send(err)
  }
})
