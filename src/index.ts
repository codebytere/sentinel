import { cloneRepo } from './operations/clone'
import { updateElectronVersion } from './operations/update-electron'
import { installDependencies } from './operations/install-deps'
import { runTests } from './operations/run-tests'

async function go () {
  const repoPath = await cloneRepo('electron-userland/spectron')

  if (repoPath) {
    await updateElectronVersion(repoPath)
    await installDependencies(repoPath)
    await runTests(repoPath)
  }
}

go()