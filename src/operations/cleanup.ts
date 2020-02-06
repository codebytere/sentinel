import * as rmrf from 'rimraf'
import { promisify } from 'util'

const rimraf = promisify(rmrf)

/**
 * Removes a temporary directory.
 *
 * @param {string} projectPath - the path to the project.
 * @returns {Promise<boolean>} - whether or not the temporary directory was removed.
 */
export async function cleanup(projectPath: string) {
  try {
    await rimraf(projectPath)
  } catch (error) {
    console.error('cleanup(): Failed to remove temporary directory ', error)
    return false
  }

  console.info('cleanup(): Successfully removed temporary directory')
  return true
}
