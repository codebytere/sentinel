import * as fs from 'fs-extra'
import * as path from 'path'

/**
 * Updates the version of Electron in the project being tested.
 *
 * @param {string} projectPath - the path to the project.
 * @returns {Promise<boolean>} - whether or not the project's Electron version was updated.
 */
export async function updateElectronVersion(
  projectPath: string,
  version?: string
) {
  const packageJSONPath = path.resolve(projectPath, 'package.json')
  const packageJSON = await fs.readJson(packageJSONPath)

  if (Object.keys(packageJSON.dependencies).includes('electron')) {
    packageJSON.dependencies.electron = version
  } else if (Object.keys(packageJSON.devDependencies).includes('electron')) {
    packageJSON.devDependencies.electron = version
  } else {
    console.error('Electron not found in project dependencies')
    return false
  }

  try {
    await fs.writeJson(packageJSONPath, packageJSON, { spaces: 2 })
  } catch (error) {
    console.error(`Failed to update Electron to ${version}`, error)
    return false
  }

  console.info(`Updated Electron version to ${version}`)
  return true
}
