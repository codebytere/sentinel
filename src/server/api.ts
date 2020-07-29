export namespace api {
  export interface ReportRequest {
    platformInstallData: {
      platform: string;
      link: string;
    };
    versionQualifier: string;
    reportCallback: string;
    commitHash: string;
  }

  export interface TestAgent {
    arch: string;
    platform: NodeJS.Platform;
    cpus: {
      cores: number;
      model: string;
      speed: number;
    };
    freeMem: number;
    release: string;
    totalMem: number;
    type: string;
    endianness: 'BE' | 'DE';
  }

  export interface ReportRequestResponse {
    sessionToken: string;
    reportsExpected: number;
    name: string;
  }

  export interface Registrant {
    appName: string;
    username: string;
    password: string;
    channel: api.ReleaseChannel;
    webhooks?: Record<string, string>;
  }

  export interface Request {
    id: number;
    platformInstallData: {
      platform: string;
      link: string;
    };
    versionQualifier: string;
    commitHash: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Report {
    id: number;
    registrantId: number;
    name: string;
    status: Status;
    reportsExpected: number;
    sessionToken: string;
    createdAt: Date;
    updatedAt: Date;
    requestId: number;
  }

  export interface TestData {
    id: number;
    status: Status;
    arch: Arch;
    os: OS;
    sourceLink?: string;
    timeStart: Date;
    timeStop: Date;
    totalPassed?: number;
    totalSkipped?: number;
    totalWarnings?: number;
    totalFailed?: number;
    logfileLink?: string;
    ciLink?: string;
    testAgent: TestAgent;
  }

  export enum Arch {
    ARM = 'arm',
    ARM64 = 'arm64',
    IA32 = 'ia32',
    x86 = 'x86',
    AMD64 = 'amd64'
  }

  export enum ReleaseChannel {
    None = 0,
    Stable = 1,
    Beta = 2,
    Nightly = 4
  }

  export enum Channel {
    STABLE = 'stable',
    BETA = 'beta',
    NIGHTLY = 'nightly'
  }

  export enum OS {
    MACOS = 'macos',
    WINDOWS = 'windows',
    LINUX = 'linux'
  }

  export enum Status {
    NOT_STARTED = 'Ready',
    PASSED = 'Passed',
    FAILED = 'Failed',
    PENDING = 'Pending',
    SKIPPED = 'Skipped',
    NOT_RUN = 'Not Run'
  }
}
