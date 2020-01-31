import { spawnLoggedPromise } from '../utils/child_process';

/**
 * Runs the test suite for a given repository.
 *
 * @param {string} projectPath - the path to the project.
 * @param {string} testCommand: the test command to run with npm.
 * @returns {Promise<boolean>} - whether or not the test suite succeeded.
 */
export async function runTests(projectPath: string, testCommand: string) {
  const result = await spawnLoggedPromise('npm', [testCommand], {
    cwd: projectPath,
  });

  if (result.success) {
    console.info('runTests(): Tests ran successfully');
  } else {
    console.error('runTests(): Tests failed');
  }

  return result.success;
}
