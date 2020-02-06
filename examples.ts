import { api } from './src/api'
import fetch from 'node-fetch'

export class ReporterExample {
  constructor(public report_callback: string, public session_token: string) {}

  async submit_report(maybeReport: Promise<api.Report>): Promise<api.ReportResponse> {
    const report = await maybeReport
    const res = await fetch(this.report_callback, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Session-Token': this.session_token
      },
      body: JSON.stringify(report)
    })

    if (res.status !== 200) {
      throw new Error(`Error submitting report ${res.statusText}`)
    }

    return res.json()
  }
}

export class TestReporterExample {
  constructor(public test_callback: string, public session_token: string) {}

  async submit_test(maybeTest: Promise<api.Test>): Promise<void> {
    const test = await maybeTest
    let res = await fetch(this.test_callback, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Session-Token': this.session_token
      },
      body: JSON.stringify(test)
    })

    if (res.status !== 200) {
      throw new Error(`Error submitting report ${res.statusText}`)
    }

    return res.json()
  }
}