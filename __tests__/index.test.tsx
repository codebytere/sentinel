import Home from '../pages/index';
import { NextApiRequest } from 'next';
import { enableFetchMocks } from 'jest-fetch-mock';
import { mRequest, mRegistrant } from 'src/server/database';

enableFetchMocks();

describe('index page', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('correctly fetches initial props', async () => {
    const requestsJSON = require('./fixtures/index.requests.json');
    const registrantsJSON = require('./fixtures/index.registrants.json');

    fetchMock.once(JSON.stringify(requestsJSON)).once(JSON.stringify(registrantsJSON));

    let req = ({
      headers: {
        host: 'electron-sentinel.herokuapp.com'
      }
    } as unknown) as NextApiRequest;

    const { requests, registrants } = await Home.getInitialProps({ req });

    expect(requests).toBeInstanceOf(Array);
    expect(requests.length).toBeGreaterThan(0);

    const { table: request } = requests[0] as mRequest;
    expect(request.id).toEqual(140);
    expect(request.platformInstallData).toStrictEqual({
      'linux-x64':
        'https://github.com/electron/nightlies/releases/download/11.0.0-nightly.20200729/electron-11.0.0-nightly.20200729-linux-x64.zip',
      'win32-x64':
        'https://github.com/electron/nightlies/releases/download/11.0.0-nightly.20200729/electron-11.0.0-nightly.20200729-win32-x64.zip',
      'darwin-x64':
        'https://github.com/electron/nightlies/releases/download/11.0.0-nightly.20200729/electron-11.0.0-nightly.20200729-darwin-x64.zip'
    });
    expect(request.versionQualifier).toEqual('11.0.0-nightly.20200729');
    expect(request.commitHash).toEqual('dd04473a97b8f120cdd749ee627abd0a5f69aadb');
    expect(request).toHaveProperty('Reports');

    expect(registrants).toBeInstanceOf(Array);
    expect(registrants.length).toBeGreaterThan(0);

    const { table: registrant } = registrants[0] as mRegistrant;
    expect(registrant.id).toEqual(9);
    expect(registrant.username).toEqual('gitify');
    expect(registrant.appName).toEqual('gitify');
    expect(registrant.webhooks).toStrictEqual({
      'linux-x64': 'http://sentinel-client.herokuapp.com/gitify',
      'win32-x64': 'http://sentinel-client.herokuapp.com/gitify',
      'darwin-x64': 'http://sentinel-client.herokuapp.com/gitify'
    });
    expect(registrant.channel).toEqual(7);
  });
});
