import { spawnLoggedPromise } from '../utils/child_process'
import { ISpawnOptions } from '../interfaces'

/**
 * Runs the test suite for a given repository.
 *
 * @param {string} projectPath - the path to the project.
 * @param {string} testCommand: the test command to run with npm.
 * @returns {Promise<boolean>} - whether or not the test suite succeeded.
 */
export async function runTests(
  projectPath: string,
  testCommand: string,
  electronPath?: string
) {
  const overridePath = electronPath
    ? `${electronPath}/${getExecutablePath(process.platform)}`
    : null
  const overrideEnv = { ELECTRON_OVERRIDE_DIST_PATH: overridePath! }

  const opts: ISpawnOptions = { cwd: projectPath }
  if (overridePath) opts.env = overrideEnv

  const result = await spawnLoggedPromise('npm', [testCommand], {
    cwd: projectPath
  })

  if (result.success) {
    console.info('runTests(): Tests ran successfully')
  } else {
    console.error('runTests(): Tests failed')
  }

  return result.success
}

function getExecutablePath(platform: string) {
  switch (platform) {
    case 'darwin':
      return 'Electron.app/Contents/MacOS/Electron'
    case 'freebsd':
    case 'linux':
      return 'electron'
    case 'win32':
      return 'electron.exe'
    default:
      throw new Error(
        'Electron builds are not available on platform: ' + platform
      )
  }
}
