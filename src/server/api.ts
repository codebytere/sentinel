export namespace api {
  export interface ReportRequest {
    // Location of installable Electron build
    platformInstallData: {
      platform: string
      link: string
    }
    // Representation of the current Electron version.
    versionQualifier: string
    // Unique per-commit url that an app will post back CI status information to.
    reportCallback: string
    // Commit hash corresponding to a PR's HEAD sha.
    commitHash: string
  }

  /**
   * Information about the agent running CI.
   */
  export interface TestAgent {
    arch: string
    platform: NodeJS.Platform
    cpus: {
      cores: number
      model: string
      speed: number
    }
    freeMem: number
    release: string
    totalMem: number
    type: string
    endianness: 'BE' | 'DE'
  }

  export interface ReportRequestResponse {
    // Must be included in future requests for this CI run.
    sessionToken: string
    // Whether or not Electron should expect to receive reports from an app
    reportsExpected: number
    // The name of this report
    name: string
  }

  /**
   * The set of CI run result data.
   */
  export interface TestData {
    id: number
    status: Status
    arch: Arch
    os: OS
    sourceLink?: string
    timeStart?: Date
    timeStop?: Date
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
   * The platform architecture type.
   */
  export enum Arch {
    ARM = 'arm',
    ARM64 = 'arm64',
    IA32 = 'ia32',
    x86 = 'x86',
    AMD64 = 'amd64'
  }

  /**
   * The platform operating system.
   */
  export enum OS {
    MACOS = 'macos',
    WINDOWS = 'windows',
    LINUX = 'linux'
  }

  /**
   * The test run status.
   */
  export enum Status {
    NOT_STARTED = 'ready',
    PASSED = 'passed',
    FAILED = 'failed',
    ABORTED = 'aborted',
    PENDING = 'pending',
    SKIPPED = 'skipped'
  }
}
