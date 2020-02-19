import { Tables } from './models'
import bcrypt from 'bcrypt'
import { IRegistrant } from './interfaces'
import { Op } from 'sequelize'

/**
 * A class that represents a single Sentinel service registrant.
 */
export class mRegistrant {
  constructor(public table: Tables.Registrant) {}

  /**
   * @returns An array of all Registrants who have opted into Sentinel.
   */
  static async FindAll() {
    const registrants = await Tables.Registrant.findAll()
    return registrants.map(reg => new mRegistrant(reg))
  }

  /**
   * Authenticates a Sentinel registrant.
   *
   * @param username The username of the Sentinel registrant.
   * @param password The password the registrant is signing in with.
   *
   * @returns true if the username and password correspond to a valid
   * registered account, else false.
   */
  static async Authenticate(username: string, password: string) {
    const registrant = await Tables.Registrant.findOne({
      where: { username }
    })

    if (!registrant) return false
    return bcrypt.compareSync(password, registrant.password)
  }

  /**
   * Creates and returns a new mRegistrant.
   *
   * @param opts
   * @param appName The name of the app being tested with Sentinel.
   * @param username The Registrant's chosen username.
   * @param password The Registrant's hashed password.
   * @param webhooks The set of callback urls for the testing platforms
   * this Registrant is opting into.
   *
   * @returns A new mRegistrant instance.
   */
  static async Create(opts: IRegistrant) {
    const registrant = await Tables.Registrant.create(opts)
    return new mRegistrant(registrant)
  }
}

/**
 * A class representing the granular CI test results based on
 * running their *own* CI against a version of Electron built
 * from a given commit in a PR.
 *
 * There will be TestData created per report for a given platform.
 */
export class mTestData {
  constructor(public table: Tables.TestData) {}

  /**
   * Creates and returns a new TestData instance.
   *
   * @param report The report associated with this TestData.
   * @param test The granular test data.
   *
   * @returns A new TestData instance.
   */
  static async NewFromReport(report: mReport, test: any) {
    const reportId = report.table.id

    const t = await Tables.TestData.create({ reportId, ...test })
    return new mTestData(t)
  }

  /**
   * Returns the granular TestData for a given Report.
   *
   * @param reportId The id of the Report corresponding to this TestData.
   */
  static async GetFromReport(reportId: number) {
    const oneWeekAgo = +new Date() - 7 * 24 * 60 * 60 * 1000
    const testDataSets = await Tables.TestData.findAll({
      where: {
        reportId,
        createdAt: {
          [Op.gt]: new Date(oneWeekAgo)
        }
      }
    })
  
    return testDataSets.map(data => new mTestData(data))
  } 
}

/**
 * A class representing CI results and metadata for
 * the specific platform on which the CI was run.
 *
 * There will be multiple reports created for each feedback
 * instance, one per platform & architecture (e.g. linux-x64 and
 * linux-ia32 would constitute two individual reports.)
 */
export class mReport {
  constructor(public table: Tables.Report) {}

  /**
   * Creates a new Report unique to a Registrant for the
   * passed request.
   *
   * @param request The Electron-CI-mediated Sentinel run.
   * @param registrant The Sentinel registrant.
   *
   * @returns A new mReport instance.
   */
  static async NewFromRequest(request: mRequest, registrant: mRegistrant) {
    return new mReport(
      await Tables.Report.create({
        requestId: request.table.id,
        registrantId: registrant.table.id
      })
    )
  }

  /**
   * Returns all the Reports associated with a Registrant.
   *
   * @param registrantId The id of the Registrant.
   */
  static async FindForRegistrant(registrantId: number) {
    const oneWeekAgo = +new Date() - 7 * 24 * 60 * 60 * 1000
    const reports = await Tables.Report.findAll({
      where: {
        registrantId,
        createdAt: {
          [Op.gt]: new Date(oneWeekAgo)
        }
      }
    })

    return reports.map(report => new mReport(report))
  }

  /**
   * Find the Report associated with a given ID, if one
   * has been previously created.
   *
   * @param id The ID of the Report instance to find.
   *
   * @returns An mReport corresponding to the passed ID.
   */
  static async FindById(id: number) {
    const record = await Tables.Report.findOne({ where: { id } })
    if (!record) {
      throw new Error(`Report id:${id} not found`)
    }
    return new mReport(record)
  }
}

/**
 * A class that represents a Sentinel run for a given commit.
 *
 * There will only ever be one of these created per-commit.
 */
export class mRequest {
  constructor(public table: Tables.Request) {}

  /**
   * Find or create a new Request instance if none exists yet, using the
   * commit hash as the primary key. If one has already been created, that
   * means that we've received a new platform install link, and so we should
   * update the platform-install map contained within the Request table with
   * the new platform information.
   *
   * @param opts
   * @param version_qualifier A version-ish string used as a determinant by each registrant.
   * @param commit_hash Commit hash corresponding to a commit sha in a PR.
   *
   * @returns A newly created or existing mRequest associated with a commit hash.
   */
  static async FindOrCreate(opts: {
    versionQualifier: string
    commitHash: string
  }) {
    const record = await Tables.Request.findOne({
      where: { commitHash: opts.commitHash }
    })
    if (record) {
      return new mRequest(record)
    } else {
      return new mRequest(
        await Tables.Request.create({
          versionQualifier: opts.versionQualifier,
          commitHash: opts.commitHash,
          platformInstallData: {}
        })
      )
    }
  }

  /**
   * Find the Request associated with a given ID, if one
   * has been previously created.
   *
   * @param id The ID of the Request instance to find.
   *
   * @returns An mRequest corresponding to the passed ID.
   */
  static async FindById(id: number): Promise<mRequest> {
    const record = await Tables.Request.findOne({ where: { id } })
    if (!record) {
      throw new Error(`Request id:${id} not found`)
    }
    return new mRequest(record)
  }
}
