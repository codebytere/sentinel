import { Tables } from './models'

export class mRegistrant {
  constructor(public table: Tables.Registrant) {}

  static async FindAll() {
    const registrants = await Tables.Registrant.findAll()
    return registrants.map(reg => new mRegistrant(reg))
  }
}

export class mTest {
  constructor(public table: Tables.TestData) {}

  static async NewFromReport(report: mReport, test: any) {
    const report_id = report.table.id
  
    const t = await Tables.TestData.create({report_id, ...test })
    return new mTest(t)
  }
}

export class mReport {
  constructor(public table: Tables.report) {}

  static async NewFromFeedback(feedback: mFeedback, defaults: any) {
    const feedback_id = feedback.table.id
    return new mReport(await Tables.report.create({
      feedback_id, 
      ...defaults
    }))
  }

  static async FindById(id: number) {
    let record = await Tables.report.findOne({ where: { id } })
    if (!record) {
      throw new Error(`Report id:${id} not found`)
    }
    return new mReport(record)
  }
}

export class mFeedback {
  constructor(public table: Tables.Feedback) {}

  static async NewFromRequest(
    req: mRequest,
    reg: mRegistrant
  ) {
    const request_id = req.table.id
    const registrant_id = reg.table.id

    return new mFeedback(
      await Tables.Feedback.create({ request_id, registrant_id })
    )
  }

  static async FindById(id: number) {
    const fb = await Tables.Feedback.findOne({ where: { id } })
    if (!fb) {
      throw new Error(`Feedback id:${id} not found`)
    }
    return new mFeedback(fb)
  }
}

export class mRequest {
  constructor(public table: Tables.Request) {}

  static async CreateNew(opts: {
    install_url: string
    version: string
  }) {
    return new mRequest(await Tables.Request.create(opts))
  }

  static async FindById(id: number) {
    let record = await Tables.Request.findOne({ where: { id } })
    if (!record) {
      throw new Error(`Request id:${id} not found`)
    }
    return new mRequest(record)
  }
}

