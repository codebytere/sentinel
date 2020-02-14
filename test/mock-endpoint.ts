import fetch from 'node-fetch'
import * as fast from 'fastify'

import { api } from '../src/server/api'
import { testAgent } from '../src/server/utils/test_agent'

const fastify = fast({ logger: true })

fastify.post('/hello', async (req) => {
  const {
    commitHash,
    platformInstallData,
    reportCallback,
    versionQualifier
  } = req.body as api.ReportRequest

  const sessionToken = 'asdfghjkl' 

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

  startCIRun(platformInstallData, reportCallback)

  return nonEmpty
})

async function startCIRun(platformData: { platform: string; link: string; }, reportCallback: string) {
  const testData = {
    name:  `${platformData.platform}-${Date.now()}`,
    status: 'success',
    arch: 'x64',
    os: 'linux',
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
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
  })
}

const start = async () => {
  try {
    await fastify.listen({ port: 8000 })
    fastify.log.info(`server listening on 8000`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()