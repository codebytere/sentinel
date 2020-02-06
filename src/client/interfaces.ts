export interface ISpawnPromiseResult {
  code: number
  stdout: string[]
  stderr: string[]
  success: boolean
}

export interface IProject {
  repo: string
  tests: string[]
}

export interface IProjectOptions {
  electronVersion?: string
  local: boolean
  path?: string
}

export interface ISpawnOptions {
  cwd: string
  env?: Record<string, string>
}
