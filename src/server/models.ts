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
 *  Report- Per-platform CI result status(es) (See mReport)
 *    |
 *    | (has many)
 *    |
 * TestData - Per platform granular data about the CI run (See mTest)
 */

import { INTEGER, JSONB, Model, Sequelize, TEXT, STRING, DATE } from 'sequelize'
import { api } from './api'

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
    webhooks!: Record<string, string>
    userName!: string
    appName!: string
    password: string
    id!: number
  }

  Registrant.init(
    {
      userName: TEXT,
      appName: TEXT,
      password: TEXT,
      webhooks: JSONB
    },
    {
      sequelize,
      tableName: 'registrant'
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
      tableName: 'request'
    }
  )

  export class Report extends Model {
    id!: number
    registrantId!: number
    requestId!: number
    reportsExpected: number
    sessionToken: string
  }

  Report.init(
    {
      registrantId: { type: INTEGER, allowNull: false },
      requestId: { type: INTEGER, allowNull: false },
      name: { type: TEXT },
      reportsExpected: { type: INTEGER },
      sessionToken: { type: STRING }
    },
    {
      sequelize,
      tableName: 'report'
    }
  )

  export class TestData extends Model {
    id!: number
    status: api.Status
    arch: api.Arch
    os: api.OS
    reportId!: number
    sourceLink!: string
    timeStart!: Date
    timeStop!: Date
    totalPassed!: number
    totalSkipped!: number
    totalWarnings!: number
    totalFailed!: number
    workspaceGzipLink!: string
    logfileLink!: string
    ciLink?: string
    testAgent: api.TestAgent
  }

  TestData.init(
    {
      status: STRING,
      arch: STRING,
      os: STRING,
      reportId: INTEGER,
      sourceLink: TEXT,
      timeStart: DATE,
      timeStop: DATE,
      totalPassed: INTEGER,
      totalSkipped: INTEGER,
      totalWarnings: INTEGER,
      totalFailed: INTEGER,
      workspaceGzipLink: TEXT,
      logfileLink: TEXT,
      ciLink: STRING,
      testAgent: JSONB
    },
    {
      sequelize,
      tableName: 'testdata'
    }
  )

  export const random = () => sequelize.random()
  export async function sync() {
    await sequelize.sync({ alter: true })
  }
}
