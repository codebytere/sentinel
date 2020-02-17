import fastify from 'fastify'
import fetch from 'node-fetch'
import bcrypt from 'bcrypt'
import { Server, IncomingMessage, ServerResponse } from 'http'
const Next = require('next')

import { api } from './api'
import { Tables } from './models'
import { mRegistrant, mRequest, mReport, mTestData } from './database'
import {
  triggerSchema,
  reportSchema,
  registerSchema,
  loginSchema
} from './utils/schemas'
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
      fast.get('/*', (request, reply) => {
        return app
          .render(request.req, reply.res, '/index', request.query)
          .then(() => {
            reply.sent = true
          })
      })

      fast.get('/signin', (request, reply) => {
        return app
          .render(request.req, reply.res, '/signin', request.query)
          .then(() => {
            reply.sent = true
          })
      })

      fast.get('/signup', (request, reply) => {
        return app
          .render(request.req, reply.res, '/signup', request.query)
          .then(() => {
            reply.sent = true
          })
      })

      fast.get('/home', (request, reply) => {
        return app
          .render(request.req, reply.res, '/home', request.query)
          .then(() => {
            reply.sent = true
          })
      })

      fast.route({
        method: 'POST',
        url: '/register',
        schema: registerSchema,
        handler: async (request, reply) => {
          const { appName, userName, webhooks } = request.body

          const hash = bcrypt.hashSync(request.body.password, 10)

          try {
            await mRegistrant.Create({
              appName,
              userName,
              password: hash,
              webhooks
            })
            reply.code(200).send(`Successfully created account for ${appName}`)
          } catch (err) {
            reply
              .code(500)
              .send(`Could not create account for ${appName}: ${err}`)
          }
        }
      })

      fast.route({
        method: 'POST',
        url: '/login',
        schema: loginSchema,
        handler: async (request, reply) => {
          const { userName, password } = request.body

          try {
            const authed = await mRegistrant.Authenticate(userName, password)
            if (authed) {
              reply.code(200).send(`Successfully authed ${userName}`)
            } else {
              reply.code(401).send(`Failed to authorize ${userName}`)
            }
          } catch (err) {
            reply.code(500).send(err)
          }
        }
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
                fast.log.info(
                  `${reg.table.appName} is not registered for platform: ${platform}`
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
              if (res.reportsExpected === undefined) {
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
              .send(
                `Sent updated webhooks for ${platform} on ${versionQualifier}`
              )
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
          if (sessionId !== report.table.sessionToken) {
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
