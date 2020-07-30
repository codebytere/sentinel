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
import { Box, Columns, Container, Hero, Table } from 'react-bulma-components';
import { IRequest, IReleaseChannelProps } from 'src/server/interfaces';
import {
  getReportStats,
  dateSort,
  isStable,
  isNightly,
  isBeta,
  getStatusIcon,
  asyncForEach
} from 'src/utils/report-helpers';
import { api } from 'src/server/api';

class ReleaseChannel extends Component<IReleaseChannelProps, {}> {
  static async getInitialProps({ req }) {
    const host = req ? req.headers.host : window.location.host;
    const isLocalHost = ['localhost:3000', '0.0.0.0:3000'].includes(host);
    const baseURL = isLocalHost ? 'http://localhost:3000' : `https://${host}`;

    const rawRequests = await fetch(`${baseURL}/requests`);
    let requests: IRequest[] = await rawRequests.json();

    const path = req ? req.url : window.location.pathname;
    const channel = path.replace('/channels/', '');

    if (channel === api.Channel.STABLE) {
      requests = requests.filter(r => isStable(r.table.versionQualifier));
    } else if (channel === api.Channel.BETA) {
      requests = requests.filter(r => isBeta(r.table.versionQualifier));
    } else {
      requests = requests.filter(r => isNightly(r.table.versionQualifier));
    }

    const result: IRequest[] = [];
    await asyncForEach(requests, async (req: IRequest) => {
      const raw = await fetch(`${baseURL}/reports/${req.table.id}`);
      const reports = await raw.json();
      result.push({ table: req.table, reports });
    });

    return { requests: result, channel };
  }

  constructor(props: IReleaseChannelProps) {
    super(props);

    this.renderRequests = this.renderRequests.bind(this);
  }

  public render() {
    const { channel, requests } = this.props;
    const sortedRequests = requests.sort(dateSort);

    return (
      <Hero color={'info'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns centered>
              <Columns.Column>
                {this.renderTrendChart(sortedRequests)}
              </Columns.Column>
            </Columns>
            <Columns centered>
              <Columns.Column>
                {this.renderRequests(channel, sortedRequests)}
              </Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    );
  }

  /* PRIVATE METHODS */

  private renderTrendChart(requests: IRequest[]) {
    const data = requests.map(r => {
      const {
        stats: { passed, total }
      } = getReportStats(r);

      const percentage = total === 0 ? total : (passed / total) * 100;
      const date = new Date(r.table.createdAt).toLocaleDateString();

      return { date, passed, total, percentage };
    });

    const CustomTooltip = tooltipData => {
      const { active, payload, label } = tooltipData;

      const style = {
        background: 'white',
        border: '2px solid black',
        padding: '10px',
        borderRadius: '10px'
      };

      if (active && payload?.length > 0) {
        const data = payload[0].payload;
        return (
          <div style={style}>
            <p className="label">{label}</p>
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
    };

    return (
      <Box>
        <ResponsiveContainer minHeight={'50vh'} width={'95%'}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} tickFormatter={number => `${number}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#000000"
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

  private renderRequests(channel: api.Channel, requests: IRequest[]) {
    const requestData = requests.map(r => {
      const { versionQualifier, id } = r.table;
      const version = versionQualifier.startsWith('v')
        ? versionQualifier
        : `v${versionQualifier}`;
      const releaseLink =
        channel === api.Channel.NIGHTLY
          ? `https://github.com/electron/nightlies/releases/tag/${version}`
          : `https://github.com/electron/electron/releases/tag/${version}`;
      const {
        stats: { failed, passed, total }
      } = getReportStats(r);

      return (
        <tr>
          <th>{getStatusIcon(failed, total)}</th>
          <th>{`${passed}/${total}`}</th>
          <td>
            <a href={releaseLink}>{version}</a>
          </td>
          <td>
            {total > 0 ? (
              <a href={`/request/${id}`}>See Reports</a>
            ) : (
              'No Reports'
            )}
          </td>
        </tr>
      );
    });

    return (
      <Box>
        <Table bordered id={'reports-table'}>
          <tbody>
            <tr>
              <th>Status</th>
              <th>Report Count</th>
              <th>Version</th>
              <th>Reports</th>
            </tr>
            {requestData}
          </tbody>
        </Table>
      </Box>
    );
  }
}

export default ReleaseChannel;
