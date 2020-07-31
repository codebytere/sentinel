import { DATABASE_URL } from './constants';
import { INTEGER, JSONB, Model, Sequelize, TEXT, STRING, DATE } from 'sequelize';
import { api } from './api';

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

export namespace Tables {
  export const sequelize = new Sequelize(DATABASE_URL!, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: !!process.env.DATABASE_SSL
    },
    logging: false
  });

  // Represented as mRegistrant
  export class Registrant extends Model {
    webhooks!: Record<string, string>;
    channel!: number;
    username!: string;
    appName!: string;
    password: string;
    id!: number;
  }

  Registrant.init(
    {
      username: TEXT,
      appName: TEXT,
      password: TEXT,
      webhooks: JSONB,
      channel: INTEGER
    },
    {
      sequelize,
      tableName: 'registrant'
    }
  );

  // Represented as mRequest
  export class Request extends Model {
    id!: number;
    platformInstallData!: Record<string, string>;
    versionQualifier!: string;
    commitHash!: string;
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
  );

  // Represented as mReport
  export class Report extends Model {
    id!: number;
    registrantId!: number;
    requestId!: number;
    reportsExpected: number;
    status?: api.Status;
    sessionToken: string;
    name: string;
  }

  Report.init(
    {
      registrantId: { type: INTEGER, allowNull: false },
      name: { type: TEXT },
      status: { type: TEXT },
      reportsExpected: { type: INTEGER },
      sessionToken: { type: STRING }
    },
    {
      sequelize,
      tableName: 'report'
    }
  );

  Report.belongsTo(Request, { foreignKey: 'requestId' });
  Report.belongsTo(Registrant, { foreignKey: 'registrantId' });

  // Represented as mTestData
  export class TestData extends Model {
    id!: number;
    status: api.Status;
    arch: api.Arch;
    os: api.OS;
    sourceLink!: string;
    timeStart!: Date;
    timeStop!: Date;
    totalTests!: number;
    totalPassed!: number;
    totalSkipped!: number;
    totalWarnings!: number;
    totalFailed!: number;
    logfileLink!: string;
    ciLink?: string;
    testAgent: api.TestAgent;
  }

  TestData.init(
    {
      status: STRING,
      arch: STRING,
      os: STRING,
      sourceLink: TEXT,
      timeStart: DATE,
      timeStop: DATE,
      totalTests: INTEGER,
      totalPassed: INTEGER,
      totalSkipped: INTEGER,
      totalWarnings: INTEGER,
      totalFailed: INTEGER,
      logfileLink: TEXT,
      ciLink: STRING,
      testAgent: JSONB
    },
    {
      sequelize,
      tableName: 'testdata'
    }
  );

  TestData.belongsTo(Report, { foreignKey: 'reportId' });
  Report.hasMany(TestData, { foreignKey: 'reportId' });

  export const random = () => sequelize.random();
  export async function sync() {
    await sequelize.sync({ alter: true, logging: console.log });
  }
}
