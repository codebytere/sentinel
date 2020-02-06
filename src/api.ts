export module api {
  export interface FeedbackRequest {
    // Location of installable Electron build
    install: string

    // Representation of the current Electron version.
    version: string

    // Unique per-commit url that an app will post back CI status information to.
    report_callback: string
  }

  export interface FeedbackRequestResponse {
    /**
     * This token must be included in future requests for this CI run.
     *
     * It is permissible to use a fixed token, but we allow the flexibility of generating per-request tokens.
     * That is one less credential sitting on CI machines waiting to be compromised.
     */
    session_token?: string

    // Whether or not Electron should expect to receive reports from an app
    expect_reports: boolean
  }

  /**
   * Representation of a CI status summary for a single platform
   *
   *
   */
  export interface Report {
    /**
     * Posting a report deletes the old report of the same name.
     * Reports are not addative or unioned, thus downstream tests should aggregate before sending.
     *
     * You SHOULD send multiple reports as a means of updating status.
     *
     * It is acceptable to post anywhere from a single test, to thousands.
     */
    name: string

    /**
     * The overall status of the report; determined holistically by the application runner.
     *
     * This may override the underlying tests. A test may fail, but the report may still pass.
     * It is up to the application runner to decide.
     *
     * It does not affect requests back to our CI. Use `please` for requests.
     */
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

  export interface Test {
    /**
     * It is up to the application how to name test.
     *
     * It is acceptable to have a single test.
     * It is also acceptable to submit thousands of tests for more granular tracking of failures between builds.
     */
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
    TESTS_READY_BUT_NOT_STARTED = 'ready',
    TESTS_RUNNING_BUT_NOT_FINISHED = 'run',
    TESTS_FINISHED_YAY_WE_PASSED = 'pass',
    TESTS_FINISHED_BUT_WE_FAILED = 'fail',
    TESTS_ABORTED_UNKNOWN_REASON = 'abort',
    TESTS_SKIPPED_POSSIBLY_NOT_RUN = 'skip'
  }
}
