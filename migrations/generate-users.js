module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('registrant', [
      {
        name: 'Spectron',
        webhooks: '{ "linux-x64": "http://localhost:8000/test-hook" }',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'VSCode',
        webhooks: '{ "linux-x64": "http://localhost:8000/test-hook", "darwin-x64": "http://localhost:8000/test-hook" }',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Postman',
        webhooks: '{ "win32-x64": "http://localhost:8000/test-hook", "darwin-x64": "http://localhost:8000/test-hook" }',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Manta',
        webhooks: '{ "mas-x64": "http://localhost:8000/test-hook", "linux-armv7l": "http://localhost:8000/test-hook" }',
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