import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as uuidv4 from 'uuid/v4';
import * as simpleGit from 'simple-git/promise';

/**
 * Clones a project repo. Returns the path it was cloned to.
 *
 * @returns {Promise<string | null>}
 */
export async function cloneRepo(repo: string) {
  const gitURL = `https://github.com/${repo}.git`;
  let tempPath: string;

  try {
    tempPath = await fs.mkdtemp(path.resolve(os.tmpdir(), uuidv4()));
  } catch (error) {
    console.error('Failed to create temporary directory: ', error);
    return null;
  }

  try {
    const git = simpleGit(tempPath);
    await git.clone(gitURL, '.');
  } catch (error) {
    console.error(`Failed to clone ${repo} to: ${tempPath}`);
    return null;
  }

  console.error(`Successfully cloned ${repo} to: ${tempPath}`);

  return tempPath;
}
