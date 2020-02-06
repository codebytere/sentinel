import { cloneRepo } from './operations/clone'
import { updateElectronVersion } from './operations/update-electron'
import { installDependencies } from './operations/install-deps'
import { runTests } from './operations/run-tests'
import { cleanup } from './operations/cleanup'

import { IProject, IProjectOptions } from './interfaces'

/**
 * Tests a given Electron-based project against a newer version of Electron.
 *
 * @param project - An object containing the project's repo and test information.
 */
export async function auditProject(
  project: IProject,
  options: IProjectOptions
) {
  const dir = await cloneRepo(project.repo)
  const testStatuses: boolean[] = []

  if (dir) {
    try {
      if (options.electronVersion) {
        await updateElectronVersion(dir, options.electronVersion)
      }

      await installDependencies(dir)

      for (const test of project.tests) {
        const success = await runTests(dir, test, options.path)
        testStatuses.push(success)
      }

      await cleanup(dir)
      return testStatuses
    } catch (e) {
      await cleanup(dir)
      return testStatuses
    }
  }

  return testStatuses
}
