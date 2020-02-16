import { Tables } from './models'
import bcrypt from 'bcrypt'

interface IRegistrantOpts {
  appName: string
  userName: string
  password: string
  webhooks: Record<string, string>
}

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

  static async Authenticate(opts: { userName: string; password: string }) {
    const registrant = await Tables.Registrant.findOne({
      where: { userName: opts.userName }
    })

    if (!registrant) return false
    return bcrypt.compareSync(opts.password, registrant.password)
  }

  static async Create(opts: IRegistrantOpts) {
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
   *
   * @param report
   * @param test
   */
  static async NewFromReport(report: mReport, test: any) {
    const reportId = report.table.id

    const t = await Tables.TestData.create({ reportId, ...test })
    return new mTestData(t)
  }
}

/**
 * A class representing CI results and metadata for
 * the specific platform on which the CI was run.
 *
 * There will be multiple reports created for each feedback
 * instance, one per platform & architecture (e.g. Linux x64 and
 * ia32 would constitute two individual reports.)
 */
export class mReport {
  constructor(public table: Tables.Report) {}

  /**
   *
   * @param feedback
   * @param defaults
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

  static async FindAll() {
    const requests = await Tables.Request.findAll()
    return requests.map(req => new mRequest(req))
  }

  /**
   * Find or create a new Request instance if none exists yet, using the
   * commit hash as the primary key. If one has already been created, that
   * means that we've received a new platform install link, and so we should
   * update the platform-install map contained within the Request table with
   * the new platform information.
   *
   * @param opts
   * @param version_qualifier a version-ish string used as a determinant by each registrant.
   * @param commit_hash commit hash corresponding to a commit sha in a PR.
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
