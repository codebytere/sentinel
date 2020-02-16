module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('registrant', [
      {
        appName: 'Manta',
        userName: 'manta',
        password: 'manta',
        webhooks: '{ "linux-x64": "http://localhost:8000/manta" }',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        appName: 'VSCode',
        userName: 'vscode',
        password: 'vscode',
        webhooks: '{ "linux-x64": "http://localhost:8000/vscode", "darwin-x64": "http://localhost:8000/vscode" }',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        appName: 'WebTorrent',
        userName: 'webtorrent',
        password: 'webtorrent',
        webhooks: '{ "win32-x64": "http://localhost:8000/webtorrent", "darwin-x64": "http://localhost:8000/webtorrent" }',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        appName: 'Signal',
        userName: 'signal',
        password: 'signal',
        webhooks: '{ "mas-x64": "http://localhost:8000/signal", "linux-armv7l": "http://localhost:8000/signal", "linux-x64": "http://localhost:8000/signal" }',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ])
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('registrant', null, {})
    queryInterface.bulkDelete('testdata', null, {})
    return queryInterface.bulkDelete('report', null, {})
  }
}