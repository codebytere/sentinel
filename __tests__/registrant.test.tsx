import { NextApiRequest } from 'next';
import { enableFetchMocks } from 'jest-fetch-mock';
import { mRegistrant } from 'src/server/database';
import Registrant from 'pages/registrant';

enableFetchMocks();

describe('registrant page', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('correctly fetches initial props', async () => {
    const registrantJSON = require('./fixtures/registrant.json');

    fetchMock.once(JSON.stringify(registrantJSON));

    let req = ({
      headers: {
        host: 'electron-sentinel.herokuapp.com'
      },
      url: '/registrants/fiddle'
    } as unknown) as NextApiRequest;

    const { registrant } = await Registrant.getInitialProps({ req });

    const { table: reg } = registrant as mRegistrant;

    expect(reg.id).toEqual(7);
    expect(reg.appName).toEqual('fiddle');
    expect(reg.username).toEqual('fiddle');
    expect(reg.channel).toEqual(7);
    expect(reg).toHaveProperty('Reports');
    expect(reg.webhooks).toStrictEqual({
      'linux-x64': 'https://sentinel-client.herokuapp.com/fiddle',
      'win32-x64': 'https://sentinel-client.herokuapp.com/fiddle',
      'darwin-x64': 'https://sentinel-client.herokuapp.com/fiddle'
    });
  });
});
