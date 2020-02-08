export namespace api {
  export interface FeedbackRequest {
    // Location of installable Electron build
    platformInstallData: { platform: string; link: string }
    // Representation of the current Electron version.
    versionQualifier: string
    // Unique per-commit url that an app will post back CI status information to.
    reportCallback: string
    // Commit hash corresponding to a PR's HEAD sha.
    commitHash: string
  }

  export interface TestAgent {
    arch: string
    platform: NodeJS.Platform
    cpus: { cores: number; model: string; speed: number }
    freeMem: number
    release: string
    totalMem: number
    type: string
    endianness: 'BE' | 'DE'
  }

  export interface FeedbackRequestResponse {
    // Must be included in future requests for this CI run.
    sessionToken?: string
    // Whether or not Electron should expect to receive reports from an app
    expectReports: boolean
  }

  /**
   * Representation of a CI status summary for a single platform.
   *
   * Multiple reports should be sent as a means of updating status.
   * Posting a report deletes the old report of the same name.
   */
  export interface Report {
    name: string
    status: Status
    effectRequest: CIEffectRequest
    arch?: Arch
    os?: OS
    testAgent: TestAgent
  }

  /**
   * When submitting a report, this is what we send back.
   */
  export interface ReportResponse {
    // URL used to submit individual tests.
    testCallback?: string
  }

  /**
   * Data
   */
  export interface TestData {
    name: string
    sourceLink?: string
    datetimeStart?: Date
    datetimeStop?: Date
    totalPassed?: number
    totalSkipped?: number
    totalAborted?: number
    totalWarnings?: number
    totalFailed?: number
    workspaceGzipLink?: string
    logfileLink?: string
    ciLink?: string
  }

  /**
   * Represents the request made by the consumer app as to
   * how the results of their tests on should affect the CI status
   * of Electron.
   */
  export enum CIEffectRequest {
    // Do not merge this PR; this commit broke tests.
    REJECT = 'reject',
    // This commit did not adversely affect us.
    APPROVE = 'approve',
    // Tests not yet finished running.
    WAIT = 'wait'
  }

  /**
   * Platform architecture.
   */
  export enum Arch {
    ARM = 'arm',
    ARM64 = 'arm64',
    IA32 = 'ia32',
    x86 = 'x86',
    AMD64 = 'amd64'
  }

  /**
   * The platform on which a test suite is being run.
   */
  export enum OS {
    MACOS = 'macos',
    WINDOWS = 'windows',
    LINUX = 'linux'
  }

  export enum Status {
    READY_NOT_STARTED = 'ready',
    RUNNING_NOT_FINISHED = 'run',
    FINISHED_PASSED = 'pass',
    FINISHED_FAILED = 'fail',
    ABORTED_UNKNOWN = 'abort',
    SKIPPED = 'skip'
  }
}
