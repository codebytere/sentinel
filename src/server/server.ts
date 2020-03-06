import fastify from 'fastify'
import fastifySession from 'fastify-session'
import fastifyCookie from 'fastify-cookie'
import fetch from 'isomorphic-unfetch'
import bcrypt from 'bcrypt'
import { Server, IncomingMessage, ServerResponse } from 'http'
const Next = require('next')

import { api } from './api'
import { Tables } from './models'
import { mRegistrant, mRequest, mReport, mTestData } from './database'
import {
  triggerSchema,
  newReportSchema,
  registerSchema,
  loginSchema,
  getTestDataSchema,
  getReportsSchema,
  getReportSchema
} from './utils/schemas'
import {
  HOST,
  PORT,
  REPORT_WEBHOOK,
  PLATFORMS,
  SESSION_SECRET,
  NODE_ENV
} from './constants'

const isDev = NODE_ENV !== 'production'
const serverOptions: fastify.ServerOptions = { logger: isDev }

const fast: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify(serverOptions)

fast
  .register(fastifyCookie)
  .register(fastifySession, {
    secret: SESSION_SECRET,
    cookie: { secure: !isDev }
  })
  .register((fast, opts, next) => {
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

        fast.get('/nightlies', (request, reply) => {
          return app
            .render(request.req, reply.res, '/nightlies', request.query)
            .then(() => {
              reply.sent = true
            })
        })

        fast.get('/request/*', (request, reply) => {
          return app
            .render(request.req, reply.res, '/reports', request.query)
            .then(() => {
              reply.sent = true
            })
        })

        fast.get('/signin', (request, reply) => {
          if (request.session.authenticated) {
            reply.redirect('/home')
          } else {
            return app
              .render(request.req, reply.res, '/signin', request.query)
              .then(() => {
                reply.sent = true
              })
          }
        })

        fast.get('/signup', (request, reply) => {
          if (request.session.authenticated) {
            reply.redirect('/home')
          } else {
            return app
              .render(request.req, reply.res, '/signup', request.query)
              .then(() => {
                reply.sent = true
              })
          }
        })

        fast.route({
          method: 'GET',
          url: '/reports/registrant/:registrantId',
          schema: getReportsSchema,
          handler: async (request, reply) => {
            if (request.session.authenticated) {
              const { registrantId } = request.params
              const reports = await mReport.FindForRegistrant(registrantId)
              reply.send(reports)
            } else {
              reply.code(401).send({ error: 'Not Authorized' })
            }
          }
        })

        fast.route({
          method: 'GET',
          url: '/reports/:requestId',
          schema: getReportSchema,
          handler: async (request, reply) => {
            const { requestId } = request.params
            const reports = await mRequest.GetReports(requestId)
            reply.send(reports)
          }
        })

        fast.route({
          method: 'GET',
          url: '/testdata/:reportId',
          schema: getTestDataSchema,
          handler: async (request, reply) => {
            const { reportId } = request.params
            const testDataSets = await mTestData.GetFromReport(reportId)
            reply.send(testDataSets)
          }
        })

        fast.get('/requests', async (request, reply) => {
          const response = await mRequest.FindAll()
          reply.send(response)
        })

        fast.get('/checkAuth', async (request, reply) => {
          if (request.session.authenticated) {
            reply.send(request.session.user)
          }
        })

        fast.route({
          method: 'POST',
          url: '/register',
          schema: registerSchema,
          handler: async (request, reply) => {
            const { appName, username, webhooks } = request.body

            const hash = bcrypt.hashSync(request.body.password, 10)

            try {
              const user = await mRegistrant.Create({
                appName,
                username,
                password: hash,
                webhooks
              })

              request.session.authenticated = true
              request.session.user = {
                name: user.table.username,
                id: user.table.id
              }
              reply.redirect('/home')
            } catch (err) {
              reply.code(500).send({
                error: `Could not create account for ${appName}: ${err}`
              })
            }
          }
        })

        fast.route({
          method: 'GET',
          url: '/home',
          handler: async (request, reply) => {
            if (request.session.authenticated) {
              return app.render(request.req, reply.res, '/home', request.query)
            } else {
              reply.redirect('/signin')
            }
          }
        })

        fast.route({
          method: 'POST',
          url: '/login',
          schema: loginSchema,
          handler: async (request, reply) => {
            const { username, password } = request.body

            try {
              const user = await mRegistrant.Authenticate(username, password)
              if (user) {
                request.session.authenticated = true
                request.session.user = {
                  name: user.table.username,
                  id: user.table.id
                }
                reply.send(request.session.user).redirect('/home')
              } else {
                reply
                  .code(401)
                  .send({ error: `Failed to authorize ${username}` })
              }
            } catch (err) {
              reply.code(500).send(err)
            }
          }
        })

        fast.route({
          method: 'GET',
          url: '/logout',
          handler: async (request, reply) => {
            if (request.session.authenticated) {
              request.destroySession(err => {
                if (err) {
                  reply.code(500).send('Internal Server Error')
                } else {
                  reply.redirect('/index')
                }
              })
            } else {
              reply.redirect('/index')
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

            const { platform, link } = platformInstallData

            if (!PLATFORMS.includes(platform)) {
              fast.log.error(`Invalid platform: ${platform}`)
              reply.code(500).send({ error: `Invalid platform: ${platform}` })
            }

            try {
              const req = await mRequest.FindOrCreate({
                installLink: { [link]: platform },
                commitHash,
                versionQualifier
              })

              // @ts-ignore - nested json is not saved automatically and
              // the types wrongly assume that only the high-level key is valid.
              await req.table.set(`platformInstallData.${platform}`, link)
              await req.table.save()

              // Fetch all current service registrants
              const registrants = await mRegistrant.FindAll()

              // Fan out platform webhooks to each registrant.
              for (let reg of registrants) {
                const platformWebhook = reg.table.webhooks[platform]
                if (!platformWebhook) {
                  fast.log.info(
                    `${reg.table.appName} is not registered for platform: ${platform}`
                  )
                  continue
                }

                // Create report only for registrants wishing to test this platform.
                const rp = await mReport.FindOrCreateFromRequest(req, reg)
                const reportCallback = `${REPORT_WEBHOOK}/report/${rp.table.id}`

                const reportRequest: api.ReportRequest = {
                  platformInstallData,
                  versionQualifier,
                  reportCallback,
                  commitHash
                }

                let regResponse
                try {
                  regResponse = await fetch(platformWebhook, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reportRequest)
                  })
                } catch (err) {
                  fast.log.error(
                    `Registrant ${reg.table.appName} failed to receive webhook: `,
                    err
                  )

                  // Remove corrupt report from the database.
                  await rp.table.destroy()
                  continue
                }

                const res: api.ReportRequestResponse = await regResponse.json()

                // Ensure that requisite data has been sent back by the registrant.
                if (res.reportsExpected === undefined) {
                  reply.code(500).send({
                    error:
                      'Invalid report expectation value: must be a number >= 0'
                  })
                } else if (!res.sessionToken) {
                  reply
                    .code(500)
                    .send({ error: 'Required session token not found' })
                }

                // Update expectation data for this per-registrant Report instance.
                rp.table.reportsExpected = res.reportsExpected
                rp.table.sessionToken = res.sessionToken
                rp.table.name = reg.table.appName

                // Only set a test run status if reports are expected.
                if (res.reportsExpected > 0) {
                  rp.table.status = api.Status.PENDING
                } else {
                  rp.table.status = api.Status.NOT_RUN
                }

                await rp.table.save()
              }

              fast.log.info(
                `Sent updated webhooks for ${platform} on ${versionQualifier}`
              )
              reply.send({
                success: `Webhooks sent to registrants on ${platform}`
              })
            } catch (err) {
              reply.code(500).send(err)
            }
          }
        })

        fast.route({
          method: 'POST',
          url: '/report/:reportId',
          schema: newReportSchema,
          handler: async (request, reply) => {
            const { reportId } = request.params
            const { authorization } = request.headers

            const report = await mReport.FindById(reportId)
            fast.log.info(`Received new TestData from ${report.table.name}`)

            // Validate that the session token matches the one for this registrant.
            if (authorization !== report.table.sessionToken) {
              reply.code(403).send({
                error: `${authorization} does not match the required token for this report`
              })
            }

            // Create new TestData from the information in the request body.
            const test: api.TestData = request.body
            fast.log.info(`Creating new TestData for ${test.os}-${test.arch}`)
            await mTestData.NewFromReport(report, test)

            if (report.table.status !== test.status) {
              fast.log.info(`Status for this TestData was: ${test.status}`)
              report.table.status = test.status
              await report.table.save()
            }

            reply.send({ success: 'TestData created and saved' })
          }
        })

        fast.setNotFoundHandler((request, reply) => {
          return app.render404(request.req, reply.res).then(() => {
            reply.sent = true
          })
        })

        fast.setErrorHandler((err, _req, reply) => {
          if (err.statusCode === 401) {
            reply.code(401).send({ error: 'Not Authorized' })
          }
          reply.send(err)
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
