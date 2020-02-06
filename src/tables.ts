let {
  DATABASE_URL = 'postgres://postgres@localhost:5432/postgres'
} = process.env

// Request - 1 request per commit (See mRequest)
//   |
// Feedback[] - 1 request per app registrant
//   |
// Feedback - Per-app feedback for the release of electron (See mFeedback)
//   |
// Report[] - the set of all CI run results across platforms
//   |
// Report - per-platform CI result status(es) (See mReport)
//   |
// Test[] - a set of Test models containing information about the CI run.
//   |
// Test - See mTest

import {
  INTEGER,
  JSONB,
  Model,
  Sequelize,
  TEXT,
  STRING,
  BOOLEAN,
  ENUM,
  DATE
} from 'sequelize'

export namespace tables {
  export const sequelize = new Sequelize(DATABASE_URL!, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: !!process.env.DATABASE_SSL
    },
    logging: false
  })

  // See: http://docs.sequelizejs.com/manual/models-definition.html

  export class registrant extends Model {
    webhook!: string
    id!: number
  }

  registrant.init(
    {
      auth_email_verified: BOOLEAN,
      auth_email: TEXT,
      auth_pass_hash: TEXT,
      display_name: TEXT,
      display_icon: TEXT,
      display_href: TEXT,
      webhook: TEXT
    },
    { sequelize, tableName: 'registrant' }
  )

  export class request extends Model {
    id!: number
    install_url!: string
  }

  request.init(
    {
      install_url: TEXT,
      version: STRING,
      commit_sha: STRING,
      commit_github_url: TEXT,
      pull_request_url: TEXT
    },
    { sequelize, tableName: 'request' }
  )

  export enum feedback_expect_reports {
    YES = 'yes',
    NO = 'no',
    UNKNOWN = 'unknown'
  }

  export class feedback extends Model {
    id!: number
    request_id!: number
    expect_reports!: boolean
    session_token!: string
  }

  feedback.init(
    {
      /* foreign keys */
      request_id: INTEGER,
      registrant_id: INTEGER,

      /* data */
      expect_reports: BOOLEAN,
      session_token: TEXT
    },
    { sequelize, tableName: 'feedback' }
  )

  export class report extends Model {
    id!: number
    feedback_id!: number
  }

  report.init(
    {
      feedback_id: { type: INTEGER, allowNull: false },
      name: { type: TEXT, allowNull: false },

      status: ENUM('ready', 'run', 'pass', 'fail', 'abort', 'skip'),
      please: ENUM('reject', 'approve', 'wait', 'skip'),

      arch: STRING,
      os: STRING,

      agent: JSONB,

      ci_link: TEXT
    },
    { sequelize, tableName: 'report' }
  )

  export class test extends Model {
    id!: number
    report_id!: number

    source_link!: string

    datetime_start!: Date
    datetime_stop!: Date

    total_ready!: number
    total_passsed!: number
    total_skipped!: number
    total_aborted!: number
    total_warnings!: number
    total_failed!: number

    workspace_gzip_link!: string
    logfile_link!: string
  }

  test.init(
    {
      report_id: INTEGER,

      source_link: TEXT,
      datetime_start: DATE,
      datetime_stop: DATE,

      total_ready: { type: INTEGER },
      total_passsed: { type: INTEGER },
      total_skipped: { type: INTEGER },
      total_aborted: { type: INTEGER },
      total_warnings: { type: INTEGER },
      total_failed: { type: INTEGER },

      workspace_gzip_link: TEXT,
      logfile_link: TEXT
    },
    { sequelize, tableName: 'test' }
  )

  export const random = () => sequelize.random()
  export async function sync() {
    await sequelize.sync()
  }
}

export type Eventually<T> = T | Promise<T>

export class mRegistrant {
  constructor(public table: tables.registrant) {}
  static async FindAll() {
    let registrants = await tables.registrant.findAll()
    return registrants.map(reg => new mRegistrant(reg))
  }
}

export class mTest {
  constructor(public table: tables.test) {}
  static async NewFromReport(report: Eventually<mReport>, test: any) {
    report = await report
    let report_id = report.table.id
    return new mTest(await tables.test.create({ report_id, ...test }))
  }
}

export class mReport {
  constructor(public table: tables.report) {}
  static async NewFromFeedback(feedback: Eventually<mFeedback>, defaults: any) {
    feedback = await feedback
    let feedback_id = feedback.table.id
    return new mReport(await tables.report.create({ feedback_id, ...defaults }))
  }
  static async FindById(id: number) {
    let record = await tables.report.findOne({ where: { id } })
    if (record) {
      return new mReport(record)
    } else {
      throw new Error(`Report id:${id} not found`)
    }
  }
}

export class mFeedback {
  constructor(public table: tables.feedback) {}
  static async NewFromRequest(
    req: Eventually<mRequest>,
    reg: Eventually<mRegistrant>
  ) {
    req = await req
    reg = await reg
    let request_id = req.table.id
    let registrant_id = reg.table.id
    return new mFeedback(
      await tables.feedback.create({ request_id, registrant_id })
    )
  }
  static async FindById(id: number) {
    let fb = await tables.feedback.findOne({ where: { id } })
    if (fb) {
      return new mFeedback(fb)
    } else {
      throw new Error(`Feedback id:${id} not found`)
    }
  }
}

export class mRequest {
  constructor(public table: tables.request) {}
  static async CreateNew(opts: {
    install_url: string
    version: string
    // commit_sha: string,
    // commit_github_url: string,
    // pull_request_url: string,
  }) {
    return new mRequest(await tables.request.create(opts))
  }
  static async FindById(id: number) {
    let record = await tables.request.findOne({ where: { id } })
    if (record) {
      return new mRequest(record)
    } else {
      throw new Error(`Request id:${id} not found`)
    }
  }
}

// export async function main() {
//   await tables.sync()
//   let req = mRequest.CreateNew({
//     install_url: "http://...",
//     commit_github_url: "http://...",
//     commit_sha: "abc",
//     pull_request_url: "http://",
//     qualifier: "version-x"
//   })

//   let fb = mFeedback.NewFromRequest(req, )
//   let re = mReport.NewFromFeedback(fb)
//   let te = await mTest.NewFromReport(re)

//   te.table.workspace_gzip_link = "http://..."

//   await te.table.save()
// }

// if (!module.parent) main()
