const {
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

export namespace Tables {
  export const sequelize = new Sequelize(DATABASE_URL!, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: !!process.env.DATABASE_SSL
    },
    logging: false
  })

  // See: http://docs.sequelizejs.com/manual/models-definition.html

  export class Registrant extends Model {
    webhook!: string
    id!: number
  }

  Registrant.init(
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

  export class Request extends Model {
    id!: number
    install_url!: string
  }

  Request.init(
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

  export class Feedback extends Model {
    id!: number
    request_id!: number
    expect_reports!: boolean
    session_token!: string
  }

  Feedback.init(
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

  export class TestData extends Model {
    id!: number
    report_id!: number

    source_link!: string

    datetime_start!: Date
    datetime_stop!: Date

    total_ready!: number
    total_passed!: number
    total_skipped!: number
    total_aborted!: number
    total_warnings!: number
    total_failed!: number

    workspace_gzip_link!: string
    logfile_link!: string
  }

  TestData.init(
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
