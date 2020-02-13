import * as fast from 'fastify'
import fetch from 'node-fetch'

import { api } from './api'
import { Tables } from './models'
import { mRegistrant, mRequest, mReport, mTestData } from './database'

const PORT = ((process.env.PORT as unknown) as number) || 3000
const {
  HOST = '0.0.0.0',
  REPORT_WEBHOOK = 'https://electron-sentinel.herokuapp.com/'
} = process.env

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
      required: ['commitHash', 'versionQualifier', 'platformInstallData'],
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
        const rp = await mReport.NewFromRequest(req, reg)
        const reportCallback = `${REPORT_WEBHOOK}${rp.table.id}`

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

        const reportRequest: api.ReportRequest = {
          platformInstallData,
          versionQualifier,
          reportCallback,
          commitHash
        }

        const resp = await fetch(platformWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reportRequest)
        })

        // Destructure registrant report request response.
        const {
          reportsExpected,
          sessionToken
        } = (await resp.json()) as api.ReportRequestResponse

        // Ensure that requisite data has been sent back by the registrant.
        if (!sessionToken) {
          throw new Error('No session token found')
        } else if (!reportsExpected) {
          throw new Error(
            'Invalid report expectation value: must be true or false.'
          )
        }

        // Update expectation data for this per-registrant Feedback instance.
        rp.table.reportsExpected = reportsExpected
        rp.table.sessionToken = sessionToken
        await rp.table.save()
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
  url: '/report/:reportId',
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
      // required: ['name', 'testAgent'],
      properties: {
        name: { type: 'string' },
        status: { type: 'string' },
        arch: { type: 'string' },
        os: { type: 'string' },
        id: { type: 'number' },
        reportId: { type: 'number' },
        sourceLink: { type: 'string' },
        // TODO(codebytere): make timeStart and timeStop date-time types
        timeStart: { type: 'string' },
        timeStop: { type: 'string' },
        totalReady: { type: 'number' },
        totalPassed: { type: 'number' },
        totalSkipped: { type: 'number' },
        totalAborted: { type: 'number' },
        totalWarnings: { type: 'number' },
        totalFailed: { type: 'number' },
        workspaceGzipLink: { type: 'string' },
        logfileLink: { type: 'string' },
        ciLink: { type: 'string' },
        testAgent: { type: 'object' }
      }
    }
  },
  handler: async (request, reply) => {
    const { reportId } = request.params

    const report = await mReport.FindById(reportId)
    const test: api.TestData = request.body

    // Create new TestData from the information in the request body.
    await mTestData.NewFromReport(report, test)

    reply.code(200).send('TestData successfully created and saved')
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

/* TEMPORARY HELPERS */

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
