'use strict'

const { QueryTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const requestIDs = await queryInterface.sequelize.query('SELECT id FROM request', {
      type: QueryTypes.SELECT
    });

    const registrants = await queryInterface.sequelize.query(`SELECT id,"appName" FROM registrant`, {
      type: QueryTypes.SELECT
    });

    const getRegistrantID = (regName) => {
      const reg = registrants.filter(r => r.appName.toLowerCase() === regName)[0]
      return reg.id
    }

    const getRequestID = () => requestIDs[0].id

    return queryInterface.bulkInsert('report', [
      {
        registrantId: getRegistrantID('vscode'),
        requestId: requestIDs[0].id,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-2707781803-968096594",
        createdAt: "2020-05-11 20:10:39.295+00",
        updatedAt: "2020-05-11 20:10:39.32+00",
        status: "Pending"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-2707781803-1745483516",
        createdAt: "2020-05-11 20:10:38.692+00",
        updatedAt: "2020-05-11 20:13:07.447+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 1,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-2315294592-1745483516",
        createdAt: "2020-04-23 18:59:57.013+00",
        updatedAt: "2020-04-28 18:29:21.904+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('vscode'),
        requestId: requestIDs[0].id + 1,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-2315294592-968096594",
        createdAt: "2020-04-23 18:59:57.08+00",
        updatedAt: "2020-04-28 18:36:36.841+00",
        status: "Failed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 2,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-4253920129-1745483516",
        createdAt: "2020-04-29 19:36:23.524+00",
        updatedAt: "2020-04-29 19:38:50.201+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('vscode'),
        requestId: requestIDs[0].id + 2,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-4253920129-968096594",
        createdAt: "2020-04-29 19:36:23.618+00",
        updatedAt: "2020-04-29 19:45:29.983+00",
        status: "Failed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 3,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-1547002537-1745483516",
        createdAt: "2020-04-30 18:53:49.346+00",
        updatedAt: "2020-04-30 18:56:20.351+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('vscode'),
        requestId: requestIDs[0].id + 3,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-1547002537-968096594",
        createdAt: "2020-04-30 18:53:49.516+00",
        updatedAt: "2020-04-30 19:04:22.389+00",
        status: "Failed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 4,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-2671338954-1745483516",
        createdAt: "2020-05-01 19:44:01.909+00",
        updatedAt: "2020-05-01 19:46:02.502+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('vscode'),
        requestId: requestIDs[0].id + 4,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-2671338954-968096594",
        createdAt: "2020-05-01 19:44:02.147+00",
        updatedAt: "2020-05-01 19:54:00.182+00",
        status: "Failed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 5,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "435678654-547828044-1745483516",
        createdAt: "2020-05-12 21:15:28.687+00",
        updatedAt: "2020-05-13 04:40:46.296+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 5,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-3437995471-1745483516",
        createdAt: "2020-05-04 20:23:55.88+00",
        updatedAt: "2020-05-04 20:26:11.998+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('vscode'),
        requestId: requestIDs[0].id + 6,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-3437995471-968096594",
        createdAt: "2020-05-04 20:23:57.54+00",
        updatedAt: "2020-05-04 20:33:17.012+00",
        status: "Failed"
      },
      {
        registrantId: getRegistrantID('vscode'),
        requestId: requestIDs[0].id + 6,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "435678654-547828044-968096594",
        createdAt: "2020-05-12 21:15:28.785+00",
        updatedAt: "2020-05-13 05:22:44.993+00",
        status: "Failed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 7,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "V5DiY14hX",
        createdAt: "2020-04-20 23:02:52.517+00",
        updatedAt: "2020-04-23 18:55:29.242+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 7,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-91477966-1745483516",
        createdAt: "2020-05-05 19:08:37.895+00",
        updatedAt: "2020-05-05 19:10:46.925+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('vscode'),
        requestId: requestIDs[0].id + 8,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-91477966-968096594",
        createdAt: "2020-05-05 19:08:38.476+00",
        updatedAt: "2020-05-05 19:15:50.558+00",
        status: "Failed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 9,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-3894345549-1745483516",
        createdAt: "2020-05-06 18:30:43.328+00",
        updatedAt: "2020-05-06 18:33:00.867+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('vscode'),
        requestId: requestIDs[0].id + 9,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-3894345549-968096594",
        createdAt: "2020-05-06 18:30:43.803+00",
        updatedAt: "2020-05-06 18:37:29.586+00",
        status: "Failed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 10,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-2121314089-1745483516",
        createdAt: "2020-05-13 18:42:36.081+00",
        updatedAt: "2020-05-13 18:44:44.544+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('vscode'),
        requestId: requestIDs[0].id + 10,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-2121314089-968096594",
        createdAt: "2020-05-13 18:42:36.263+00",
        updatedAt: "2020-05-13 18:47:43.462+00",
        status: "Failed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 11,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-547828044-1745483516",
        createdAt: "2020-05-07 18:27:19.865+00",
        updatedAt: "2020-05-07 18:29:43.461+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 11,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-547828044-968096594",
        createdAt: "2020-05-07 18:27:20.331+00",
        updatedAt: "2020-05-07 18:33:49.304+00",
        status: "Failed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 12,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-899242435-1745483516",
        createdAt: "2020-05-08 18:49:48.331+00",
        updatedAt: "2020-05-08 18:52:03.016+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('vscode'),
        requestId: requestIDs[0].id + 12,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-899242435-968096594",
        createdAt: "2020-05-08 18:49:48.631+00",
        updatedAt: "2020-05-08 18:57:30.199+00",
        status: "Failed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 13,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "123456789-175516696-1745483516",
        createdAt: "2020-05-11 20:35:35.141+00",
        updatedAt: "2020-05-12 02:06:00.087+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('vscode'),
        requestId: requestIDs[0].id + 13,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "123456789-175516696-968096594",
        createdAt: "2020-05-11 20:35:35.181+00",
        updatedAt: "2020-05-12 02:19:51.211+00",
        status: "Failed"
      },
      {
        registrantId: getRegistrantID('fiddle'),
        requestId: requestIDs[0].id + 14,
        name: "fiddle",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-171802216-1745483516",
        createdAt: "2020-05-12 18:33:20.448+00",
        updatedAt: "2020-05-12 18:35:53.773+00",
        status: "Passed"
      },
      {
        registrantId: getRegistrantID('vscode'),
        requestId: requestIDs[0].id + 14,
        name: "vscode",
        reportsExpected: 1,
        sessionToken: "dd04473a97b8f120cdd749ee627abd0a5f69aadb-171802216-968096594",
        createdAt: "2020-05-12 18:33:20.662+00",
        updatedAt: "2020-05-12 18:40:47.443+00",
        status: "Failed"
      }
    ])
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('report', null, {})
  }
};