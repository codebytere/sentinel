'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('request', [
      {
        platformInstallData: JSON.stringify(`{
          "linux-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200507/electron-10.0.0-nightly.20200507-linux-x64.zip",
          "win32-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200507/electron-10.0.0-nightly.20200507-win32-x64.zip",
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200507/electron-10.0.0-nightly.20200507-darwin-x64.zip"
        }`),
        versionQualifier: "10.0.0-nightly.20200507",
        commitHash: "dd04473a97b8f120cdd749ee627abd0a5f69aadb",
        createdAt: "2020-05-07 18:27:19.827+00",
        updatedAt: "2020-05-07 18:27:20.541+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "linux-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200504/electron-10.0.0-nightly.20200504-linux-x64.zip",
          "win32-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200504/electron-10.0.0-nightly.20200504-win32-x64.zip",
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200504/electron-10.0.0-nightly.20200504-darwin-x64.zip"
        }`),
        versionQualifier: "10.0.0-nightly.20200504",
        commitHash: "dd04473a97b8f120cdd749ee627abd0a5f69aadb",
        createdAt: "2020-05-04 20:23:55.785+00",
        updatedAt: "2020-05-04 20:23:57.812+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "linux-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200505/electron-10.0.0-nightly.20200505-linux-x64.zip",
          "win32-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200505/electron-10.0.0-nightly.20200505-win32-x64.zip",
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200505/electron-10.0.0-nightly.20200505-darwin-x64.zip"
        }`),
        versionQualifier: "10.0.0-nightly.20200505",
        commitHash: "dd04473a97b8f120cdd749ee627abd0a5f69aadb",
        createdAt: "2020-05-05 19:08:37.861+00",
        updatedAt: "2020-05-05 19:08:38.647+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "linux-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200511/electron-10.0.0-nightly.20200511-linux-x64.zip",
          "win32-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200511/electron-10.0.0-nightly.20200511-win32-x64.zip",
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200511/electron-10.0.0-nightly.20200511-darwin-x64.zip"
        }`),
        versionQualifier: "10.0.0-nightly.20200511",
        commitHash: "dd04473a97b8f120cdd749ee627abd0a5f69aadb",
        createdAt: "2020-05-11 20:10:38.649+00",
        updatedAt: "2020-05-11 20:10:39.463+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "linux-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200506/electron-10.0.0-nightly.20200506-linux-x64.zip",
          "win32-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200506/electron-10.0.0-nightly.20200506-win32-x64.zip",
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200506/electron-10.0.0-nightly.20200506-darwin-x64.zip"
        }`),
        versionQualifier: "10.0.0-nightly.20200506",
        commitHash: "dd04473a97b8f120cdd749ee627abd0a5f69aadb",
        createdAt: "2020-05-06 18:30:43.287+00",
        updatedAt: "2020-05-06 18:30:43.994+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/v9.0.0-nightly.20191225/electron-v9.0.0-nightly.20191225-darwin-x64.zip"
        }`),
        versionQualifier: "9.0.0-nightly.20191225",
        commitHash: "123456789",
        createdAt: "2020-05-11 20:35:35.131+00",
        updatedAt: "2020-05-11 20:35:35.131+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "linux-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200508/electron-10.0.0-nightly.20200508-linux-x64.zip",
          "win32-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200508/electron-10.0.0-nightly.20200508-win32-x64.zip",
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200508/electron-10.0.0-nightly.20200508-darwin-x64.zip"
        }`),
        versionQualifier: "10.0.0-nightly.20200508",
        commitHash: "dd04473a97b8f120cdd749ee627abd0a5f69aadb",
        createdAt: "2020-05-08 18:49:48.295+00",
        updatedAt: "2020-05-08 18:49:49.067+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/v10.0.0-nightly.20200507/electron-10.0.0-nightly.20200507-darwin-x64.zip"
        }`),
        versionQualifier: "10.0.0-nightly.20200507",
        commitHash: "435678654",
        createdAt: "2020-05-12 21:15:28.665+00",
        updatedAt: "2020-05-12 21:15:28.665+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "linux-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200512/electron-10.0.0-nightly.20200512-linux-x64.zip",
          "win32-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200512/electron-10.0.0-nightly.20200512-win32-x64.zip",
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200512/electron-10.0.0-nightly.20200512-darwin-x64.zip"
        }`),
        versionQualifier: "10.0.0-nightly.20200512",
        commitHash: "dd04473a97b8f120cdd749ee627abd0a5f69aadb",
        createdAt: "2020-05-12 18:33:20.401+00",
        updatedAt: "2020-05-12 18:33:20.897+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "linux-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200501/electron-10.0.0-nightly.20200501-linux-x64.zip",
          "win32-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200501/electron-10.0.0-nightly.20200501-win32-x64.zip",
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200501/electron-10.0.0-nightly.20200501-darwin-x64.zip"
        }`),
        versionQualifier: "10.0.0-nightly.20200501",
        commitHash: "dd04473a97b8f120cdd749ee627abd0a5f69aadb",
        createdAt: "2020-05-01 19:44:01.882+00",
        updatedAt: "2020-05-01 19:44:02.307+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "linux-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200428/electron-10.0.0-nightly.20200428-linux-x64.zip",
          "win32-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200428/electron-10.0.0-nightly.20200428-win32-x64.zip",
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200428/electron-10.0.0-nightly.20200428-darwin-x64.zip"
        }`),
        versionQualifier: "10.0.0-nightly.20200423",
        commitHash: "dd04473a97b8f120cdd749ee627abd0a5f69aadb",
        createdAt: "2020-04-23 18:59:56.988+00",
        updatedAt: "2020-04-28 18:26:17.455+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "linux-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200429/electron-10.0.0-nightly.20200429-linux-x64.zip",
          "win32-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200429/electron-10.0.0-nightly.20200429-win32-x64.zip",
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200429/electron-10.0.0-nightly.20200429-darwin-x64.zip"
        }`),
        versionQualifier: "10.0.0-nightly.20200429",
        commitHash: "dd04473a97b8f120cdd749ee627abd0a5f69aadb",
        createdAt: "2020-04-29 19:36:23.491+00",
        updatedAt: "2020-04-29 19:36:23.822+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "linux-x64": "https://github.com/electron/nightlies/releases/download/v9.0.0-nightly.20191225/electron-v9.0.0-nightly.20191225-linux-x64.zip",
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/v9.0.0-nightly.20191225/electron-v9.0.0-nightly.20191225-darwin-x64.zip"
        }`),
        versionQualifier: "9.0.0-nightly.20191225",
        commitHash: "12345678",
        createdAt: "2020-04-20 23:02:52.462+00",
        updatedAt: "2020-04-21 19:14:16.75+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "linux-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200430/electron-10.0.0-nightly.20200430-linux-x64.zip",
          "win32-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200430/electron-10.0.0-nightly.20200430-win32-x64.zip",
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200430/electron-10.0.0-nightly.20200430-darwin-x64.zip"
        }`),
        versionQualifier: "10.0.0-nightly.20200430",
        commitHash: "dd04473a97b8f120cdd749ee627abd0a5f69aadb",
        createdAt: "2020-04-30 18:53:49.299+00",
        updatedAt: "2020-04-30 18:53:49.669+00"
      },
      {
        platformInstallData: JSON.stringify(`{
          "linux-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200513/electron-10.0.0-nightly.20200513-linux-x64.zip",
          "win32-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200513/electron-10.0.0-nightly.20200513-win32-x64.zip",
          "darwin-x64": "https://github.com/electron/nightlies/releases/download/10.0.0-nightly.20200513/electron-10.0.0-nightly.20200513-darwin-x64.zip"
        }`),
        versionQualifier: "10.0.0-nightly.20200513",
        commitHash: "dd04473a97b8f120cdd749ee627abd0a5f69aadb",
        createdAt: "2020-05-13 18:42:36.02+00",
        updatedAt: "2020-05-13 18:42:36.579+00"
      }
    ])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('request', null, {})
  }
};
