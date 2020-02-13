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
      name: { type: TEXT, allowNull: false },
      reportsExpected: { type: INTEGER, allowNull: false },
      sessionToken: { type: STRING, allowNull: false }
    },
    {
      sequelize,
      tableName: 'Report'
    }
  )

  export class TestData extends Model {
    id!: number
    status: api.Status
    arch: api.Arch
    os: api.OS
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
      totalReady: INTEGER,
      totalPassed: INTEGER,
      totalSkipped: INTEGER,
      totalAborted: INTEGER,
      totalWarnings: INTEGER,
      totalFailed: INTEGER,
      workspace_gzip_link: TEXT,
      logfileLink: TEXT,
      ciLink: STRING,
      testAgent: JSONB
    },
    {
      sequelize,
      tableName: 'TestData'
    }
  )

  export const random = () => sequelize.random()
  export async function sync() {
    await sequelize.sync({ alter: true, force: true })
  }
}
