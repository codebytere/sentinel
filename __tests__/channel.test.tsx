import Channel from '../pages/channel';
import { NextApiRequest } from 'next';
import { enableFetchMocks } from 'jest-fetch-mock';
import { mRequest } from 'src/server/database';

enableFetchMocks();

describe('channel page', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('correctly fetches initial props', async () => {
    const requestsJSON = require('./fixtures/requests.json');

    fetchMock.once(JSON.stringify(requestsJSON));

    let req = ({
      headers: {
        host: 'electron-sentinel.herokuapp.com'
      },
      url: '/channels/beta'
    } as unknown) as NextApiRequest;

    const { requests, channel } = await Channel.getInitialProps({ req });

    expect(channel).toEqual('beta');

    expect(requests).toBeInstanceOf(Array);
    expect(requests.length).toEqual(1);

    const { table: request } = requests[0] as mRequest;
    expect(request.id).toEqual(149);
    expect(request.versionQualifier).toEqual('v10.0.0-beta.25');
    expect(request).toHaveProperty('Reports');
  });
});
