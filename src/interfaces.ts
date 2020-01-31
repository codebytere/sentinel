export interface ISpawnPromiseResult {
  code: number;
  stdout: string[];
  stderr: string[];
  success: boolean;
}

export interface IProject {
  repo: string
  tests: string[];
}