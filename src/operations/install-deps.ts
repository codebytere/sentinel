import { spawnLoggedPromise } from '../utils/child_process';

/**
 * Installs dependencies in a given directory.
 *
 * @param {string} projectPath - the path to the project.
 * @returns {Promise<boolean>} - whether or not the project's dependencies were successfully installed.
 */
export async function installDependencies(projectPath: string) {
  const result = await spawnLoggedPromise('npm', ['install'], {
    cwd: projectPath,
  });

  if (result.success) {
    console.info('installDependencies(): Successfully installed dependencies');
  } else {
    console.error('installDependencies(): Failed to install dependencies');
  }

  return result.success;
}
