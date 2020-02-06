import * as fast from 'fastify'
import fetch from 'node-fetch'
import * as Joi from '@hapi/joi'

import { api } from './api'
import { Tables } from './models'
import {
  mRegistrant,
  mRequest,
  mFeedback,
  mReport,
  mTest,
} from './database'

const { PORT = '3000' } = process.env
const fastify = fast({ logger: true })

fastify.route({
  method: 'POST',
  url: '/trigger',
  schema: {
    body: Joi.object()
      .keys({
        version: Joi.string()
          .pattern(/^[0-9]+.[0-9]+.[0-9]+(?:-[a-z]+.[0-9]+)?$/)
          .required(),
        install: Joi.string()
          .uri({ scheme: 'https' })
          .required()
      })
      .required()
  },
  handler: async request => {
    // When a new gzipped tarball is uploaded to SOME_LOCATION,
    // trigger web-hooks to all registered consumers

    const { install, version } = request.body

    const req = await mRequest.CreateNew({
      install_url: install,
      version
    })

    const registrants = await mRegistrant.FindAll()

    for (let reg of registrants) {
      const fb = await mFeedback.NewFromRequest(req, reg)
      const report_callback = `http://localhost:${PORT}/report/${fb.table.id}`

      const feedback_request = {
        install,
        version,
        report_callback
      } as api.FeedbackRequest

      // Get FeedbackResponse from app webhooks
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
  }
})

fastify.route({
  method: 'POST',
  url: '/report/:feedback_id',
  schema: {
    params: Joi.object()
      .keys({
        feedback_id: Joi.number().required()
      })
      .required()
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
    params: Joi.object()
      .keys({
        report_id: Joi.number().required()
      })
      .required(),
    body: Joi.object()
      .keys({
        // TODO
      })
      .required()
  },
  handler: async request => {
    const { report_id } = request.params
    const report = await mReport.FindById(report_id)
    const test: api.Test = request.body

    // TODO: validate test information
    await mTest.NewFromReport(report, test)
  }
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
