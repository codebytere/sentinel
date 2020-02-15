import fetch from 'node-fetch'
import fastify from 'fastify'
import * as shortid from 'shortid'
import { Server, IncomingMessage, ServerResponse } from 'http'

import { api } from '../server/api'
import { testAgent } from '../server/utils/test_agent'

const serverOptions: fastify.ServerOptions = {
  logger: !!(process.env.NODE_ENV !== "development")
}

const fast: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify(serverOptions);

fast.post('/test-hook', async (req) => {
  const {
    platformInstallData,
    reportCallback,
    versionQualifier
  } = req.body as api.ReportRequest

  const sessionToken = shortid.generate()

  if (!versionQualifier.startsWith('9')) {
    const empty: api.ReportRequestResponse = {
      reportsExpected: 0,
      sessionToken
    }
    return empty
  }

  const nonEmpty: api.ReportRequestResponse = {
    reportsExpected: 1,
    sessionToken
  }

  startCIRun(platformInstallData, reportCallback, sessionToken)
  return nonEmpty
})

async function startCIRun(
  platformData: { platform: string; link: string; },
  reportCallback: string,
  token: string
) {
  const sysData = platformData.platform.split('-')
  const testData = {
    name:  `${platformData.platform}-${Date.now()}`,
    status: 'success',
    os: sysData[0],
    arch: sysData[1],
    sourceLink: 'www.example.com',
    timeStart: '1943-09-03 01:00:00-06',
    timeStop: '1943-09-03 01:00:00-06',
    totalPassed: 40,
    totalSkipped: 0,
    totalAborted: 10,
    totalWarnings: 0,
    totalFailed: 5,
    workspaceGzipLink: 'www.example.com',
    logfileLink: 'www.example.com',
    ciLink: 'www.example.com',
    testAgent: testAgent()
  }

  await fetch(reportCallback, {
    method: 'POST',
    headers: {
      'sessionId': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
  })
}

const start = async () => {
  try {
    await fast.listen({ port: 8000 })
    fast.log.info(`server listening on 8000`)
  } catch (err) {
    fast.log.error(err)
    process.exit(1)
  }
}

start()