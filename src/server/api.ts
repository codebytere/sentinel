export module api {
  export interface FeedbackRequest {
    // Location of installable Electron build
    install_data: { platform: string; link: string }
    // Representation of the current Electron version.
    version_qualifier: string
    // Unique per-commit url that an app will post back CI status information to.
    report_callback: string
    // Commit hash corresponding to a PR's HEAD sha.
    commit_hash: string
  }

  export interface FeedbackRequestResponse {
    // Must be included in future requests for this CI run.
    session_token?: string
    // Whether or not Electron should expect to receive reports from an app
    expect_reports: boolean
  }

  /**
   * Representation of a CI status summary for a single platform.
   *
   * Multiple reports should be sent as a means of updating status.
   * Posting a report deletes the old report of the same name.
   */
  export interface Report {
    // The name of the report.
    name: string

    // The overall status of the report; determined holistically by the application runner.
    status: Status

    effect_request: CIEffectRequest

    arch?: Arch
    os?: OS

    // Similar to a user agent. See utils/test_agent.ts.
    test_agent?: any
  }

  /**
   * When submitting a report, this is what we send back.
   */
  export interface ReportResponse {
    // URL used to submit individual tests.
    test_callback?: string
  }

  /**
   * Data
   */
  export interface TestData {
    // Name for a
    name: string

    // Link to project source code.
    source_link?: string

    datetime_start?: Date
    datetime_stop?: Date

    // Aggregates of underlying test/assertions.
    total_passed?: number
    total_skipped?: number
    total_aborted?: number
    total_warnings?: number
    total_failed?: number

    // Download for debugging build/test artifacts.
    workspace_gzip_link?: string

    // Link to shared log files.
    logfile_link?: string

    // CI platform website link.
    ci_link?: string
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
