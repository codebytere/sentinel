import Reports from '../pages/reports';
import { NextApiRequest } from 'next';
import { enableFetchMocks } from 'jest-fetch-mock';
import { mReport } from 'src/server/database';

enableFetchMocks();

describe('reports page', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('correctly fetches initial props', async () => {
    const reportsJSON = require('./fixtures/reports.json');
    const requestJSON = require('./fixtures/request.json');

    fetchMock.once(JSON.stringify(reportsJSON)).once(JSON.stringify(requestJSON));

    let req = ({
      headers: {
        host: 'electron-sentinel.herokuapp.com'
      },
      url: '/channels/nightly/2020-07-29'
    } as unknown) as NextApiRequest;

    const { reports, channel, date, versionQualifier } = await Reports.getInitialProps({ req });

    expect(channel).toEqual('nightly');
    expect(date).toEqual('2020-07-29');
    expect(versionQualifier).toEqual('11.0.0-nightly.20200729');

    expect(reports).toBeInstanceOf(Array);
    expect(reports.length).toEqual(5);

    const { table: report } = reports[0] as mReport;

    expect(report.id).toEqual(226);
    expect(report.registrantId).toEqual(7);
    expect(report.requestId).toEqual(140);
    expect(report.name).toEqual('fiddle');
    expect(report.status).toEqual('Passed');

    expect(report).toHaveProperty('TestData');
    expect(report).toHaveProperty('Registrant');
  });
});
