import { spawnLoggedPromise } from '../utils/child_process';

/**
 * Installs dependencies in a given directory.
 *
 * @param {string} repoPath
 * @returns {Promise<boolean>}
 */
export async function installDependencies(repoPath: string) {
  const result = await spawnLoggedPromise('npm', ['install'], {
    cwd: repoPath,
  });

  if (result.success) {
    console.info('installDependencies(): Successfully installed dependencies');
  } else {
    console.error('installDependencies(): Failed to install dependencies');
  }

  return result.success;
}
