'use strict';

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
        appName: 'Fiddle',
        username: 'fiddle',
        password: bcrypt.hashSync('fiddle', 10),
        webhooks: '{ "mas-x64": "http://localhost:8000/fiddle", "linux-armv7l": "http://localhost:8000/fiddle", "linux-x64": "http://localhost:8000/fiddle" }',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ])
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('registrant', null, {})
  }
};
