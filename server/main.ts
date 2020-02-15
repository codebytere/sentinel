import fastify from 'fastify'
import fetch from 'node-fetch'
import { Server, IncomingMessage, ServerResponse } from 'http'
const Next = require('next')

import { api } from './api'
import { Tables } from './models'
import { mRegistrant, mRequest, mReport, mTestData } from './database'
import { triggerSchema, reportSchema } from './utils/schemas'
import { HOST, PORT, REPORT_WEBHOOK, PLATFORMS } from './constants'

const isDev = !!(process.env.NODE_ENV !== 'development')
const serverOptions: fastify.ServerOptions = { logger: isDev }

const fast: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify(serverOptions)

fast.register((fast, opts, next) => {
  const app = Next({ dev: isDev })
  app
    .prepare()
    .then(() => {
      fast.get('/*', (req, reply) => {
        return app.render(req.req, reply.res, '/index', req.query).then(() => {
          reply.sent = true
        })
      })

      fast.get('/sign_in', (req, reply) => {
        return app
          .render(req.req, reply.res, '/sign_in', req.query)
          .then(() => {
            reply.sent = true
          })
      })

      fast.get('/sign_up', (req, reply) => {
        return app
          .render(req.req, reply.res, '/sign_up', req.query)
          .then(() => {
            reply.sent = true
          })
      })

      fast.route({
        method: 'POST',
        url: '/trigger',
        schema: triggerSchema,
        handler: async (request, reply) => {
          const {
            platformInstallData,
            versionQualifier,
            commitHash
          } = request.body

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
              if (!PLATFORMS.includes(platform)) {
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
                  .send(
                    'Invalid report expectation value: must be a number >= 0'
                  )
              } else if (!res.sessionToken) {
                reply.code(500).send('Required session token not found')
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

      fast.route({
        method: 'POST',
        url: '/report/:reportId',
        schema: reportSchema,
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
              .send(
                `${sessionId} does not match the required token for this report`
              )
          }

          // Create new TestData from the information in the request body.
          await mTestData.NewFromReport(report, test)

          reply.code(200).send('TestData successfully created and saved')
        }
      })

      fast.setNotFoundHandler((request, reply) => {
        return app.render404(request.req, reply.res).then(() => {
          reply.sent = true
        })
      })

      next()
    })
    .catch((err: Error) => next(err))
})

const start = async () => {
  try {
    await Tables.sync()
    await fast.listen({ port: PORT, host: HOST })
    fast.log.info(`server listening on ${PORT}`)
  } catch (err) {
    fast.log.error(err)
    process.exit(1)
  }
}

start()