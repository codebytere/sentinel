const {
  DATABASE_URL = 'postgres://postgres@localhost:5432/postgres'
} = process.env

/**
 * HIERARCHY
 *
 * Request - 1 request per commit (See mRequest)
 *    |
 *    | (has many)
 *    |
 * Feedback -  Per-app feedback for the release of electron (See mFeedback)
 *    |
 *    | (has many)
 *    |
 *  Report- Per-platform CI result status(es) (See mReport)
 *    |
 *    | (has many)
 *    |
 * TestData - Per platform granular data about the CI run (See mTest)
 */

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
    webhook!: Record<string, string>
    name!: string
    id!: number
  }

  Registrant.init(
    {
      name: TEXT,
      webhook: JSONB
    },
    {
      sequelize,
      tableName: 'Registrant'
    }
  )

  export class Request extends Model {
    id!: number
    platformInstallData!: Record<string, string>
    versionQualifier!: string
    commitHash!: string
  }

  Request.init(
    {
      platformInstallData: JSONB,
      versionQualifier: STRING,
      commitHash: STRING
    },
    {
      sequelize,
      tableName: 'Request'
    }
  )

  export enum FeedbackExpectReports {
    YES = 'yes',
    NO = 'no',
    UNKNOWN = 'unknown'
  }

  export class Feedback extends Model {
    id!: number
    requestId!: number
    expectReports!: boolean
    sessionToken!: string
  }

  Feedback.init(
    {
      /* foreign keys */
      requestId: INTEGER,
      registrantId: INTEGER,

      /* data */
      expectReports: BOOLEAN,
      sessionToken: TEXT
    },
    {
      sequelize,
      tableName: 'Feedback'
    }
  )

  export class Report extends Model {
    id!: number
    feedbackId!: number
  }

  Report.init(
    {
      feedbackId: { type: INTEGER, allowNull: false },
      name: { type: TEXT, allowNull: false },
      status: ENUM('ready', 'run', 'pass', 'fail', 'abort', 'skip'),
      effectRequest: ENUM('reject', 'approve', 'wait'),
      arch: STRING,
      os: STRING,
      testAgent: JSONB
    },
    {
      sequelize,
      tableName: 'Report'
    }
  )

  export class TestData extends Model {
    id!: number
    reportId!: number
    sourceLink!: string
    datetimeStart!: Date
    datetimeStop!: Date
    totalReady!: number
    totalPassed!: number
    totalSkipped!: number
    totalAborted!: number
    totalWarnings!: number
    totalFailed!: number
    workspaceGzipLink!: string
    logfileLink!: string
  }

  TestData.init(
    {
      reportId: INTEGER,
      sourceLink: TEXT,
      datetimeStart: DATE,
      datetimeStop: DATE,
      totalReady: { type: INTEGER },
      totalPassed: { type: INTEGER },
      totalSkipped: { type: INTEGER },
      totalAborted: { type: INTEGER },
      totalWarnings: { type: INTEGER },
      totalFailed: { type: INTEGER },
      workspace_gzip_link: TEXT,
      logfileLink: TEXT
    },
    {
      sequelize,
      tableName: 'TestData'
    }
  )

  export const random = () => sequelize.random()
  export async function sync() {
    await sequelize.sync({ alter: true })
  }
}
