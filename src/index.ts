import { cloneRepo } from './operations/clone';
import { updateElectronVersion } from './operations/update-electron';
import { installDependencies } from './operations/install-deps';
import { runTests } from './operations/run-tests';
import { cleanup } from './operations/cleanup';

import { IProject } from './interfaces';

/**
 * Tests a given Electron-based project against a newer version of Electron.
 * 
 * @param project - An object containing the project's repo and test information.
 */
export async function auditProject (project: IProject) {
  const dir = await cloneRepo(project.repo);
  const testStatuses: boolean[] = [];

  if (dir) {
    await updateElectronVersion(dir);
    await installDependencies(dir);

    for (const test of project.tests) {
      const success = await runTests(dir, test);
      testStatuses.push(success);
    }

    await cleanup(dir);
    return testStatuses;
  }

  return testStatuses;
}
