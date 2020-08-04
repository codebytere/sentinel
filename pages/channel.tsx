import { Component } from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Breadcrumb, Columns, Container, Heading, Hero, Table } from 'react-bulma-components';
import { IRequest, IReleaseChannelProps } from 'src/server/interfaces';
import { dateSort, formatDateString, getBaseURL, getChannelForVersion, getStats } from 'src/utils';
import { api } from 'src/server/api';
import { NextApiRequest } from 'next';

class ReleaseChannel extends Component<IReleaseChannelProps, {}> {
  static async getInitialProps({ req }: { req: NextApiRequest | null }) {
    const baseURL = getBaseURL(req);

    const path = req?.url ? req.url : window.location.pathname;
    const channel = path.replace('/channels/', '');

    const rawRequests = await fetch(`${baseURL}/requests`);
    const requests: IRequest[] = (await rawRequests.json()).filter((r: IRequest) => {
      return channel === getChannelForVersion(r.table.versionQualifier);
    });

    return { requests, channel };
  }

  constructor(props: IReleaseChannelProps) {
    super(props);

    this.renderRequests = this.renderRequests.bind(this);
  }

  public render() {
    const { channel, requests } = this.props;
    const { Body } = Hero;
    const { Column } = Columns;

    const sortedRequests = requests.sort(dateSort);

    return (
      <Hero color={'white'} size={'fullheight'}>
        <Body>
          <Container>
            <Columns centered>
              <Column>{this.renderBreadcrumb(channel)}</Column>
            </Columns>
            <Columns centered>
              <Column>{this.renderTrendChart(channel, sortedRequests)}</Column>
            </Columns>
            <Columns centered>
              <Column>{this.renderRequests(channel, sortedRequests.reverse())}</Column>
            </Columns>
          </Container>
        </Body>
      </Hero>
    );
  }

  /* PRIVATE METHODS */

  private getBackgroundColor(channel: string) {
    if (channel === api.Channel.STABLE) {
      return '#66cccc';
    } else if (channel === api.Channel.BETA) {
      return '#ff99cc';
    } else if (channel === api.Channel.NIGHTLY) {
      return '#90eebf';
    } else {
      throw new Error('Invalid channel type');
    }
  }

  private renderBreadcrumb(channel: string) {
    const formattedChannel = channel[0].toUpperCase() + channel.slice(1);

    return (
      <Breadcrumb
        size={'medium'}
        separator={'arrow'}
        items={[
          {
            name: 'Home',
            url: '/index'
          },
          {
            name: formattedChannel,
            url: '/channels/beta',
            active: true
          }
        ]}
      ></Breadcrumb>
    );
  }

  private renderTrendChart(channel: string, requests: IRequest[]) {
    const graphTitle = channel[0].toUpperCase() + channel.slice(1);
    const bgColor = this.getBackgroundColor(channel);
    const data = requests.map(r => {
      const {
        report: { passed, total }
      } = getStats(r.table.Reports!);

      const percentage = total === 0 ? total : (passed / total) * 100;
      const date = new Date(r.table.createdAt).toLocaleDateString();

      return { date, passed, total, percentage };
    });

    return (
      <Box style={{ backgroundColor: bgColor }}>
        <Heading size={4} className={'has-text-centered'}>
          {graphTitle} Report Statistics
        </Heading>
        <ResponsiveContainer
          className={'has-background-white'}
          minHeight={'50vh'}
          // If it's 100% it does not resize properly -
          // see https://github.com/recharts/recharts/issues/1423.
          width={'99%'}
        >
          <LineChart data={data} margin={{ top: 30, right: 20, left: 0, bottom: 15 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis domain={[0, 100]} tickFormatter={number => `${number}%`} />
            <Tooltip content={<this.CustomTooltip />} />
            <Legend />
            <Line
              type='monotone'
              dataKey='percentage'
              stroke='#000000'
              strokeWidth={2}
              dot={{ stroke: '#000000', strokeWidth: 4 }}
              connectNulls={true}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  }

  // TODO(codebytere): Type this when https://github.com/recharts/recharts/pull/2182
  // is released in a new version of recharts.
  private CustomTooltip(tooltipData) {
    const { active, payload, label } = tooltipData;

    if (active && payload?.length > 0) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            background: 'white',
            border: '2px solid black',
            padding: '10px',
            borderRadius: '10px'
          }}
        >
          <p className='label'>{label}</p>
          <p>
            <b>Reports Passed:</b> {data.passed}
          </p>
          <p>
            <b>Total Reports:</b> {data.total}
          </p>
        </div>
      );
    }

    return null;
  }

  private renderRequests(channel: api.Channel, requests: IRequest[]) {
    const bgColor = this.getBackgroundColor(channel);

    const requestData = requests.map(r => {
      const { versionQualifier, createdAt } = r.table;

      const date = formatDateString(createdAt);
      const version = versionQualifier.startsWith('v') ? versionQualifier : `v${versionQualifier}`;
      const releaseLink =
        channel === api.Channel.NIGHTLY
          ? `https://github.com/electron/nightlies/releases/tag/${version}`
          : `https://github.com/electron/electron/releases/tag/${version}`;

      const { report, platform, test } = getStats(r.table.Reports!);

      return (
        <tr>
          <th>{formatDateString(r.table.createdAt)}</th>
          <td>
            <a href={releaseLink}>{version}</a>
          </td>
          <th>{`${report.passed}/${report.total}`}</th>
          <th>{`${platform.passed}/${platform.total}`}</th>
          <th>{`${test.passed}/${test.total}`}</th>
          <td>
            {report.total > 0 ? (
              <a href={`/channels/${channel}/${date}`}>See Reports</a>
            ) : (
              'No Reports'
            )}
          </td>
        </tr>
      );
    });

    return (
      <Box style={{ backgroundColor: bgColor }}>
        <div
          className={'table-container'}
          style={{ overflowY: 'auto', maxHeight: '50vh', borderRadius: '8px' }}
        >
          <Table bordered className={'is-hoverable'} id={'reports-table'}>
            <tbody>
              <tr>
                <th>Date</th>
                <th>Version</th>
                <th>Apps Passing</th>
                <th>Platforms Passing</th>
                <th>Tests Passing</th>
                <th>Reports</th>
              </tr>
              {requestData}
            </tbody>
          </Table>
        </div>
      </Box>
    );
  }
}

export default ReleaseChannel;
