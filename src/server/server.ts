import fastify from 'fastify';
import fastifySession from 'fastify-session';
import fastifyCookie from 'fastify-cookie';
import fetch from 'node-fetch';
import bcrypt from 'bcrypt';
import { Server, IncomingMessage, ServerResponse } from 'http';
const Next = require('next');

import { api } from './api';
import { Tables } from './models';
import { mRegistrant, mRequest, mReport, mTestData } from './database';
import {
  triggerSchema,
  newReportSchema,
  registerSchema,
  loginSchema,
  getRequestSchema,
  updateSettingsSchema,
  registrantSchema,
  getReportsByChannelSchema,
  authHeaderSchema
} from './schemas';
import {
  HOST,
  PORT,
  REPORT_WEBHOOK,
  PLATFORMS,
  SESSION_SECRET,
  NODE_ENV,
  DATA_AUTH_TOKEN
} from './constants';

const isDev = NODE_ENV !== 'production';
const serverOptions: fastify.ServerOptions = { logger: isDev };

const fast: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify(
  serverOptions
);

fast
  .register(fastifyCookie)
  .addHook('preHandler', (request, reply, next) => {
    fast.log.info(request.headers);
    next();
  })
  .register(fastifySession, {
    secret: SESSION_SECRET,
    cookie: {
      secure: !isDev,
      path: '/*'
    }
  })
  .register((fast, opts, next) => {
    const app = Next({ dev: isDev });
    app
      .prepare()
      .then(() => {
        /*****  PAGE ROUTES *****/

        fast.route({
          method: 'GET',
          url: '/*',
          handler: (request, reply) => {
            return app.render(request.req, reply.res, '/index', request.query).then(() => {
              reply.sent = true;
            });
          }
        });

        fast.route({
          method: 'GET',
          url: '/request/*',
          handler: (request, reply) => {
            return app.render(request.req, reply.res, '/reports', request.query).then(() => {
              reply.sent = true;
            });
          }
        });

        fast.route({
          method: 'GET',
          url: '/registrants/:name',
          handler: (request, reply) => {
            return app.render(request.req, reply.res, '/registrant', request.query).then(() => {
              reply.sent = true;
            });
          }
        });

        fast.route({
          method: 'GET',
          url: '/channels/:channel',
          handler: (request, reply) => {
            return app.render(request.req, reply.res, '/channel', request.query).then(() => {
              reply.sent = true;
            });
          }
        });

        fast.route({
          method: 'GET',
          url: '/channels/:channel/:date',
          handler: (request, reply) => {
            return app.render(request.req, reply.res, '/reports', request.query).then(() => {
              reply.sent = true;
            });
          }
        });

        fast.route({
          method: 'GET',
          url: '/signin',
          handler: (request, reply) => {
            if (request.session.authenticated) {
              reply.redirect('/index');
            } else {
              return app.render(request.req, reply.res, '/signin', request.query).then(() => {
                reply.sent = true;
              });
            }
          }
        });

        fast.route({
          method: 'GET',
          url: '/signup',
          handler: (request, reply) => {
            if (request.session.authenticated) {
              reply.redirect('/index');
            } else {
              return app.render(request.req, reply.res, '/signup', request.query).then(() => {
                reply.sent = true;
              });
            }
          }
        });

        fast.route({
          method: 'GET',
          url: '/settings',
          handler: (request, reply) => {
            if (!request.session.authenticated) {
              reply.redirect('/index');
            } else {
              return app.render(request.req, reply.res, '/settings', request.query).then(() => {
                reply.sent = true;
              });
            }
          }
        });

        /***** DATA ROUTES *****/

        /** GET **/

        fast.route({
          method: 'GET',
          url: '/reports/:channel/:date',
          schema: getReportsByChannelSchema,
          handler: async (request, reply) => {
            const { channel, date } = request.params as { channel: api.Channel; date: string };
            const { authorization } = request.headers as { authorization: string };

            if (authorization !== DATA_AUTH_TOKEN) {
              reply.code(401).send({ error: 'Not authorized to access data' });
            }

            const reports = await mReport.FindByChannelAndDate(channel, date);

            reply.send(reports);
          }
        });

        fast.route({
          method: 'GET',
          url: '/requests/:requestId',
          schema: getRequestSchema,
          handler: async (request, reply) => {
            const { requestId } = request.params as { requestId: number };
            const { authorization } = request.headers as { authorization: string };

            if (authorization !== DATA_AUTH_TOKEN) {
              reply.code(401).send({ error: 'Not authorized to access data' });
            }

            fast.log.info(`Fetching request for id: ${requestId}`);

            const req = await mRequest.FindById(requestId);
            reply.send(req);
          }
        });

        fast.route({
          method: 'GET',
          url: '/requests',
          schema: authHeaderSchema,
          handler: async (request, reply) => {
            const { authorization } = request.headers as { authorization: string };

            if (authorization !== DATA_AUTH_TOKEN) {
              reply.code(401).send({ error: 'Not authorized to access data' });
            }

            const response = await mRequest.FindAll();
            reply.send(response);
          }
        });

        fast.get('/checkAuth', async (request, reply) => {
          if (request.session.authenticated) {
            reply.send({ authed: true, user: request.session.user });
          } else {
            reply.send({ authed: false });
          }
        });

        fast.route({
          method: 'GET',
          url: '/logout',
          handler: async (request, reply) => {
            if (request.session.authenticated) {
              fast.log.info('Logging out current user');

              request.session.authenticated = false;
              request.session.user = {};
              request.destroySession(err => {
                if (err) {
                  reply.code(500).send({ error: 'Failed to destroy user session' });
                } else {
                  reply.redirect('/index');
                }
              });
            } else {
              reply.redirect('/index');
            }
          }
        });

        fast.route({
          method: 'GET',
          url: '/registrant/data/:username',
          schema: registrantSchema,
          handler: async (request, reply) => {
            const { username } = request.params as { username: string };
            const { authorization } = request.headers as { authorization: string };

            if (authorization !== DATA_AUTH_TOKEN) {
              reply.code(401).send({ error: 'Not authorized to access data' });
            }

            const registrant = await mRegistrant.GetAllDataForRegistrant(username);
            if (!registrant) {
              fast.log.error('Could not find current user data');
              reply.code(500).send({ error: `No Registrant with username: ${username}` });
            } else {
              fast.log.info(registrant);
              reply.send(registrant);
            }
          }
        });

        fast.route({
          method: 'GET',
          url: '/current-user',
          handler: async (request, reply) => {
            if (request.session.authenticated) {
              fast.log.info(`Fetching data for current user ${request.session.user.name}`);

              const currentUserId = request.session.user.id;
              const registrant = await mRegistrant.Find(currentUserId);

              if (!registrant) {
                fast.log.error('Could not find current user data');
                reply.code(500).send({ error: `No user with id: ${currentUserId}` });
              } else {
                fast.log.info(registrant);
                reply.send(registrant);
              }
            } else {
              fast.log.error('Cannot get information for unauthenticated user');
              reply.code(401).send({ error: 'Cannot get information for unauthenticated user' });
            }
          }
        });

        fast.route({
          method: 'GET',
          url: '/registrants',
          schema: authHeaderSchema,
          handler: async (request, reply) => {
            const { authorization } = request.headers as { authorization: string };

            if (authorization !== DATA_AUTH_TOKEN) {
              reply.code(401).send({ error: 'Not authorized to access data' });
            }

            const registrants = await mRegistrant.FindAll();
            reply.send(registrants);
          }
        });

        /** POST **/

        fast.route({
          method: 'POST',
          url: '/register',
          schema: registerSchema,
          handler: async (request, reply) => {
            const { appName, channel, username, webhooks } = request.body as api.Registrant;

            fast.log.info(`Creating new account for username: ${username} and app: ${appName}`);

            const hash = bcrypt.hashSync(request.body.password, 10);

            try {
              const user = await mRegistrant.Create({
                appName,
                username,
                password: hash,
                webhooks,
                channel
              });

              fast.log.info(`Successfully created new account for ${username}`);

              request.session.authenticated = true;
              request.session.user = {
                name: user.table.username,
                id: user.table.id
              };

              reply.redirect('/index');
            } catch (err) {
              fast.log.error(`Failed to create account for ${appName}: ${err}`);
              reply.code(500).send({
                error: `Failed to create account for ${appName}: ${err}`
              });
            }
          }
        });

        fast.route({
          method: 'POST',
          url: '/login',
          schema: loginSchema,
          handler: async (request, reply) => {
            if (request.session.authenticated) {
              fast.log.info(`${request.session.user.name} is already logged in`);
              reply.send(request.session.user).redirect('/index');
            }

            const { username, password } = request.body as { username: string; password: string };

            try {
              fast.log.info(`Logging in ${username}`);

              const user = await mRegistrant.Authenticate(username, password);
              if (user) {
                fast.log.info(`Successfully authorized ${username}`);

                request.session.authenticated = true;
                request.session.user = {
                  name: user.table.username,
                  id: user.table.id
                };
                reply.send(request.session.user).redirect('/index');
              } else {
                fast.log.error(`Failed to authorize ${username}`);

                reply.code(401).send({ error: `Failed to authorize ${username}` });
              }
            } catch (err) {
              reply.code(500).send(err);
            }
          }
        });

        fast.route({
          method: 'POST',
          url: '/update-user',
          schema: updateSettingsSchema,
          handler: async (request, reply) => {
            if (request.session.authenticated) {
              const { webhooks, channel, password } = request.body as api.Registrant;
              const authedUser = request.session.user.name;

              fast.log.info(`Updating user data for ${authedUser}`);

              const id = request.session.user.id;
              const success = await mRegistrant.UpdateSettings({ id, webhooks, channel, password });
              if (!success) {
                reply.code(500).send({
                  error: `Failed to update settings for ${authedUser}`
                });
              } else {
                fast.log.info(`Successfully updated settings for ${authedUser}`);
                reply.send({
                  success: `Updated settings for ${authedUser}`
                });
              }
            } else {
              fast.log.error('Cannot update settings for unauthenticated user');
              reply.redirect('/index');
            }
          }
        });

        fast.route({
          method: 'POST',
          url: '/trigger',
          schema: triggerSchema,
          handler: async (request, reply) => {
            const {
              platformInstallData,
              versionQualifier,
              commitHash
            } = request.body as api.ReportRequest;

            const { platform, link } = platformInstallData;

            if (!PLATFORMS.includes(platform)) {
              fast.log.error(`Invalid platform: ${platform}`);
              reply.code(500).send({ error: `Invalid platform: ${platform}` });
            }

            try {
              const req = await mRequest.FindOrCreate({
                installLink: { [platform]: link },
                commitHash,
                versionQualifier
              });

              // @ts-ignore - types wrongly assume that only the high-level key is valid.
              await req.table.set(`platformInstallData.${platform}`, link);
              await req.table.save();

              // Fetch all current service registrants
              const registrants = await mRegistrant.FindAll();

              fast.log.info(`Sending webhook data to ${registrants.length} registrants`);

              // Fan out platform webhooks to each registrant.
              for (let reg of registrants) {
                const platformWebhook = reg.table.webhooks[platform];
                if (!platformWebhook) {
                  fast.log.info(`${reg.table.appName} is not registered for platform: ${platform}`);
                  continue;
                }

                // Create report only for registrants wishing to test this platform.
                const rp = await mReport.FindOrCreateFromRequest(req, reg);
                const reportCallback = `${REPORT_WEBHOOK}/report/${rp.table.id}`;

                const reportRequest: api.ReportRequest = {
                  platformInstallData,
                  versionQualifier,
                  reportCallback,
                  commitHash
                };

                let regResponse;
                try {
                  regResponse = await fetch(platformWebhook, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reportRequest)
                  });
                } catch (err) {
                  fast.log.error(
                    `Registrant ${reg.table.appName} failed to receive webhook: `,
                    err
                  );

                  // Remove corrupt report from the database.
                  await rp.table.destroy();
                  continue;
                }

                const res: api.ReportRequestResponse = await regResponse.json();

                // Ensure that requisite data has been sent back by the registrant.
                if (res.reportsExpected === undefined) {
                  fast.log.error('Invalid report expectation value: must be a number >= 0');
                  reply.code(500).send({
                    error: 'Invalid report expectation value: must be a number >= 0'
                  });
                } else if (!res.sessionToken) {
                  fast.log.error('Required session token not found');
                  reply.code(500).send({ error: 'Required session token not found' });
                }

                // Update expectation data for this per-registrant Report instance.
                rp.table.reportsExpected = res.reportsExpected;
                rp.table.sessionToken = res.sessionToken;
                rp.table.name = reg.table.appName;

                // Only set a test run status if reports are expected.
                if (res.reportsExpected > 0) {
                  rp.table.status = api.Status.PENDING;
                } else {
                  rp.table.status = api.Status.NOT_RUN;
                }

                await rp.table.save();
              }

              fast.log.info(`Sent updated webhooks for ${platform} on ${versionQualifier}`);
              reply.send({
                success: `Webhooks sent to registrants on ${platform}`
              });
            } catch (err) {
              reply.code(500).send(err);
            }
          }
        });

        fast.route({
          method: 'POST',
          url: '/report/:reportId',
          schema: newReportSchema,
          handler: async (request, reply) => {
            const { reportId } = request.params as { reportId: number };
            const { authorization } = request.headers as { authorization: string };

            const report = await mReport.FindById(reportId);
            if (!report) {
              fast.log.info(`No report found with id ${reportId}`);
              return;
            }

            fast.log.info(`Received new TestData from ${report.table.name}`);

            // Validate that the session token matches the one for this registrant.
            if (authorization !== report.table.sessionToken) {
              fast.log.info(`${authorization} does not match the required token for this report`);
              reply.code(403).send({
                error: `${authorization} does not match the required token for this report`
              });
            }

            // Create new TestData from the information in the request body.
            const test: api.TestData = request.body;

            // Update existing TestData if one exists, otherwise create a new one.
            fast.log.info(`Creating new TestData for ${test.os}-${test.arch}`);
            await mTestData.CreateOrUpdateFromReport(report, test);

            if (report.table.status !== test.status) {
              fast.log.info(`Status for this TestData was: ${test.status}`);
              report.table.status = test.status;
              await report.table.save();
            }

            fast.log.info('TestData saved');
            reply.send({ success: 'TestData saved' });
          }
        });

        /***** HANDLERS *****/

        fast.setNotFoundHandler((request, reply) => {
          return app.render404(request.req, reply.res).then(() => {
            reply.sent = true;
          });
        });

        fast.setErrorHandler((err, _req, reply) => {
          if (err.statusCode === 401) {
            reply.code(401).send({ error: 'Not Authorized' });
          }
          reply.send(err);
        });

        next();
      })
      .catch((err: Error) => next(err));
  });

const start = async () => {
  try {
    await Tables.sync();
    await fast.listen({ port: PORT, host: HOST });
    fast.log.info(`server listening on ${PORT}`);
  } catch (err) {
    fast.log.error(err);
    process.exit(1);
  }
};

start();
