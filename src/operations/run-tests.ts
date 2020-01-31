import { spawnLoggedPromise } from '../utils/child_process';

/**
 * Runs the test suite for a given repository.
 *
 * @param {string} repoPath
 * @returns {Promise<boolean>}
 */
export async function runTests(repoPath: string) {
  const result = await spawnLoggedPromise('npm', ['test'], {
    cwd: repoPath,
  });

  if (result.success) {
    console.info('runTests(): Tests ran successfully');
  } else {
    console.error('runTests(): Tests failed');
  }

  return result.success;
}
