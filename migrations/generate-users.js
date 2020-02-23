const bcrypt = require('bcrypt')

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('registrant', [
      {
        appName: 'Manta',
        username: 'manta',
        password: bcrypt.hashSync('manta', 10),
        webhooks: '{ "linux-x64": "http://localhost:8000/manta" }',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        appName: 'VSCode',
        username: 'vscode',
        password: bcrypt.hashSync('vscode', 10),
        webhooks: '{ "linux-x64": "http://localhost:8000/vscode", "darwin-x64": "http://localhost:8000/vscode" }',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        appName: 'WebTorrent',
        username: 'webtorrent',
        password: bcrypt.hashSync('webtorrent', 10),
        webhooks: '{ "win32-x64": "http://localhost:8000/webtorrent", "darwin-x64": "http://localhost:8000/webtorrent" }',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        appName: 'Signal',
        username: 'signal',
        password: bcrypt.hashSync('signal', 10),
        webhooks: '{ "mas-x64": "http://localhost:8000/signal", "linux-armv7l": "http://localhost:8000/signal", "linux-x64": "http://localhost:8000/signal" }',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ])
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('registrant', null, {})
    queryInterface.bulkDelete('testdata', null, {})
    queryInterface.bulkDelete('request', null, {})
    return queryInterface.bulkDelete('report', null, {})
  }
}