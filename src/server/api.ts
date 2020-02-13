export namespace api {
  export interface ReportRequest {
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

  export interface ReportRequestResponse {
    // Must be included in future requests for this CI run.
    sessionToken?: string
    // Whether or not Electron should expect to receive reports from an app
    reportsExpected: number
  }

  /**
   * Data
   */
  export interface TestData {
    name: string
    status: Status
    arch: Arch
    os: OS
    sourceLink?: string
    timeStart?: Date
    datetimeStop?: Date
    totalPassed?: number
    totalSkipped?: number
    totalAborted?: number
    totalWarnings?: number
    totalFailed?: number
    workspaceGzipLink?: string
    logfileLink?: string
    ciLink?: string
    testAgent: TestAgent
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
