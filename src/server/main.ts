import * as fast from 'fastify'
import fetch from 'node-fetch'

import { api } from './api'
import { Tables } from './models'
import { mRegistrant, mRequest, mReport, mTestData } from './database'

const PORT = ((process.env.PORT as unknown) as number) || 3000
const {
  HOST = '0.0.0.0',
  REPORT_WEBHOOK = 'http://localhost:3000' // 'https://electron-sentinel.herokuapp.com/'
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
  'linux-arm64',
  'linux-ia32',
  'linux-x64'
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

      // Fan out platform webhooks to each registrant.
      for (let reg of registrants) {
        if (!platforms.includes(platform)) {
          throw new Error(`Invalid platform: ${platform}`)
        }

        // Check that the registrant has registered for this platform-specific webhook.
        const platformWebhook = reg.table.webhooks[platform]
        if (!platformWebhook) {
          console.warn(
            `${reg.table.name} is not registered for platform: ${platform}`
          )
          continue
        }

        // Create report only for registrants wishing to test this platform.
        const rp = await mReport.NewFromRequest(req, reg)
        const reportCallback = `${REPORT_WEBHOOK}/report/${rp.table.id}`

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

        const res: api.ReportRequestResponse = await resp.json()

        // Ensure that requisite data has been sent back by the registrant.
        if (!res.reportsExpected) {
          reply
            .code(500)
            .send('Invalid report expectation value: must be a number >= 0')
        } else if (!res.sessionToken) {
          reply.code(500).send('No session token found')
        }

        // Update expectation data for this per-registrant Report instance.
        rp.table.reportsExpected = res.reportsExpected
        rp.table.sessionToken = res.sessionToken
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
    headers: {
      type: 'object',
      required: ['sessionId'],
      properties: {
        sessionId: { type: 'string' }
      }
    },
    body: {
      type: 'object',
      // TODO(codebytere): determine what we want to require from consumers
      // required: ['name', 'testAgent'],
      properties: {
        name: { type: 'string' },
        status: { type: 'string' },
        arch: { type: 'string' },
        os: { type: 'string' },
        id: { type: 'number' },
        reportId: { type: 'number' },
        sourceLink: { type: 'string' },
        // TODO(codebytere): make timeStart and timeStop date-time types?
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
    const { sessionId } = request.headers

    const report = await mReport.FindById(reportId)
    const test: api.TestData = request.body

    // Validate that the session token matches the one for this registrant.
    const token = report.table.sessionToken
    if (sessionId !== token) {
      reply
        .code(403)
        .send(`${sessionId} does not match the required token for this report`)
    }

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
