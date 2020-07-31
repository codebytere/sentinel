import { Tables } from './models';
import bcrypt from 'bcrypt';
import { Op, Sequelize } from 'sequelize';
import { api } from './api';

const MINIMUM_TIME_AGO = new Date(new Date().setDate(new Date().getDate() - 100));

/**
 * A class that represents a single Sentinel service registrant.
 */
export class mRegistrant {
  constructor(public table: Tables.Registrant) {}

  /**
   * @returns An array of all Registrants who have opted into Sentinel.
   */
  static async FindAll() {
    let registrants: Tables.Registrant[] = [];

    try {
      registrants = await Tables.Registrant.findAll();
    } catch (err) {
      console.error(err);
    }

    return registrants.map(reg => new mRegistrant(reg));
  }

  /**
   * @param id The id of the Sentinel registrant.
   *
   * @returns The Registrant with the specified id or, false if none found.
   */
  static async Find(id: number) {
    let registrant: Tables.Registrant | null = null;

    try {
      registrant = await Tables.Registrant.findOne({
        where: { id }
      });
    } catch (err) {
      console.error(err);
    }

    return registrant ? new mRegistrant(registrant) : false;
  }

  /**
   * Updates webhooks for a Sentinel registrant.
   *
   * @param id The id of the Sentinel registrant.
   * @param webhooks The webhooks to update for the registrant.
   *
   * @returns true if the webhooks were successfully updated, else false.
   */
  static async UpdateSettings(id: number, webhooks: Record<string, string>, channel: number) {
    const registrant = await Tables.Registrant.findOne({
      where: { id }
    });

    if (!registrant) return false;

    // Update release channel to test against.
    await registrant.update('channel', channel);

    // Update all webhooks which were changed.
    for (const hook in webhooks) {
      if (webhooks[hook] !== '') {
        // @ts-ignore - ts wrongly assumes that only the high-level key is valid.
        await registrant.set(`webhooks.${hook}`, webhooks[hook]);
      }
    }

    await registrant.save();
    return true;
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
    let registrant: Tables.Registrant | null = null;

    try {
      registrant = await Tables.Registrant.findOne({
        where: { username }
      });
    } catch (err) {
      console.log(err);
    }

    if (!registrant || !bcrypt.compareSync(password, registrant.password)) {
      return false;
    }

    return new mRegistrant(registrant);
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
  static async Create(opts: api.Registrant) {
    const registrant = await Tables.Registrant.create(opts);
    return new mRegistrant(registrant);
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
   * Creates or updates and returns a new TestData instance.
   *
   * @param report The report associated with this TestData.
   * @param test The granular test data.
   *
   * @returns A new TestData instance.
   */
  static async CreateOrUpdateFromReport(report: mReport, test: api.TestData) {
    const reportId = report.table.id;

    const testData = await Tables.TestData.findAll({
      where: {
        reportId
      }
    });

    const filtered = testData.filter(td => {
      const sameOS = td.os === test.os;
      const sameArch = td.arch === test.arch;
      return sameOS && sameArch;
    });

    let td;
    if (filtered.length === 1) {
      const existing = filtered[0];
      td = await Tables.TestData.update({ ...test }, { where: { id: existing.id } });
    } else {
      td = await Tables.TestData.create({ reportId, ...test });
    }

    return new mTestData(td);
  }

  /**
   * @param reportId The id of the Report corresponding to this TestData.
   *
   * @returns An array of granular TestData for a given Report.
   */
  static async GetFromReport(reportId: number) {
    let testData: Tables.TestData[] = [];

    try {
      testData = await Tables.TestData.findAll({
        where: {
          reportId,
          createdAt: {
            [Op.gt]: new Date(MINIMUM_TIME_AGO)
          }
        }
      });
    } catch (err) {
      console.error(err);
    }

    return testData.map(data => new mTestData(data));
  }
}

/**
 * A class representing CI results and metadata for
 * the specific platform on which the CI was run.
 *
 * There will one report created for each Registrant per Request.
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
  static async FindOrCreateFromRequest(request: mRequest, registrant: mRegistrant) {
    const report = await Tables.Report.findOne({
      where: {
        requestId: request.table.id,
        registrantId: registrant.table.id
      }
    });
    if (report) {
      return new mReport(report);
    } else {
      return new mReport(
        await Tables.Report.create({
          requestId: request.table.id,
          registrantId: registrant.table.id
        })
      );
    }
  }

  /**
   * @param reportId The id of the Report.
   *
   * @returns An array of all Reports associated with this Request.
   */
  static async GetTestData(reportId: number) {
    let testData: Tables.TestData[] = [];

    try {
      testData = await Tables.TestData.findAll({
        where: {
          reportId,
          createdAt: {
            [Op.gt]: new Date(MINIMUM_TIME_AGO)
          }
        }
      });
    } catch (err) {
      console.error(err);
    }

    return testData.map(t => new mTestData(t));
  }

  /**
   * @param channel The release channel - stable, beta, or nightly.
   * @param date A date string in YYYY-MM-DD format.
   *
   * @returns An array of all Reports created for the passed channel on the passed date.
   */
  static async FindByChannelAndDate(channel: api.Channel, date: string) {
    let releaseChannel = api.ReleaseChannel.None;
    if (channel === api.Channel.STABLE) {
      releaseChannel = api.ReleaseChannel.Stable;
    } else if (channel === api.Channel.BETA) {
      releaseChannel = api.ReleaseChannel.Beta;
    } else if (channel === api.Channel.NIGHTLY) {
      releaseChannel = api.ReleaseChannel.Nightly;
    }

    const DAY_MILLISECONDS = 86400000;
    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + DAY_MILLISECONDS);
    const createdQuery = {
      createdAt: {
        [Op.gt]: startDate,
        [Op.lt]: endDate
      }
    };

    let reports: Tables.Report[] = [];
    try {
      reports = await Tables.Report.findAll({
        where: createdQuery,
        include: [
          {
            model: Tables.Registrant,
            where: Sequelize.literal(`channel & ${releaseChannel} != 0`)
          },
          {
            model: Tables.TestData,
            where: createdQuery
          }
        ]
      });
    } catch (err) {
      console.error(err);
    }

    return reports.map(report => new mReport(report));
  }

  /**
   * @param registrantId The id of the Registrant.
   *
   * @returns An array of all Reports associated with a Registrant.
   */
  static async FindForRegistrant(registrantId: number) {
    let reports: Tables.Report[] = [];

    try {
      reports = await Tables.Report.findAll({
        where: {
          registrantId,
          createdAt: {
            [Op.gt]: new Date(MINIMUM_TIME_AGO)
          }
        }
      });
    } catch (err) {
      console.error(err);
    }

    return reports.map(report => new mReport(report));
  }

  /**
   * Find the Report associated with a given ID, if one
   * has been previously created.
   *
   * @param id The id of the Report instance to find.
   *
   * @returns An mReport corresponding to the passed id or null if not found.
   */
  static async FindById(id: number) {
    let report: mReport | null = null;

    try {
      const rep = await Tables.Report.findOne({ where: { id } });
      if (rep) {
        report = new mReport(rep);
      }
    } catch (err) {
      console.error(err);
    }

    return report;
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
   * @returns An array of all Requests created in the last week.
   */
  static async FindAll() {
    let requests: Tables.Request[] = [];

    try {
      requests = await Tables.Request.findAll({
        where: {
          createdAt: {
            [Op.gt]: new Date(MINIMUM_TIME_AGO)
          }
        }
      });
    } catch (err) {
      console.error(err);
    }

    return requests.map(r => new mRequest(r));
  }

  /**
   * @param requestId The id of the Request.
   *
   * @returns An array of all Reports associated with this Request.
   */
  static async GetReports(requestId: number): Promise<mReport[]> {
    const reports = await Tables.Report.findAll({
      where: {
        requestId,
        createdAt: {
          [Op.gt]: new Date(MINIMUM_TIME_AGO)
        }
      },
      include: [Tables.Request]
    });

    return reports.map(r => new mReport(r));
  }

  /**
   * Find or create a new Request instance if none exists yet, using the
   * commit hash as the primary key. If one has already been created, that
   * means that we've received a new platform install link, and so we should
   * update the platform-install map contained within the Request table with
   * the new platform information.
   *
   * @param opts
   * @param versionQualifier A version-ish string used as a determinant by each registrant.
   * @param commitHash Commit hash corresponding to a commit sha in a PR.
   * @param installLink: the platform/link object to add to this Request's platform install data.
   *
   * @returns A newly created or existing mRequest associated with a commit hash.
   */
  static async FindOrCreate(opts: {
    versionQualifier: string;
    commitHash: string;
    installLink: Record<string, string>;
  }) {
    const request = await Tables.Request.findOne({
      where: {
        commitHash: opts.commitHash,
        versionQualifier: opts.versionQualifier
      }
    });
    if (request) {
      return new mRequest(request);
    } else {
      return new mRequest(
        await Tables.Request.create({
          versionQualifier: opts.versionQualifier,
          commitHash: opts.commitHash,
          platformInstallData: opts.installLink
        })
      );
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
  static async FindById(id: number): Promise<mRequest | null> {
    let request: mRequest | null = null;

    try {
      const req = await Tables.Request.findOne({ where: { id } });
      if (req) {
        request = new mRequest(req);
      }
    } catch (err) {
      console.error(err);
    }

    return request;
  }
}
