import { Component } from 'react';

import { Box, Columns, Container, Heading, Hero, Table } from 'react-bulma-components';
import { IRequest, IHomeProps, IRegistrant } from 'src/server/interfaces';
import { api } from 'src/server/api';
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
import { getReportStats, dateSort } from 'src/utils/report-helpers';

class Home extends Component<IHomeProps, {}> {
  static async getInitialProps({ req }) {
    const host = req ? req.headers.host : window.location.host;
    const isLocalHost = ['localhost:3000', '0.0.0.0:3000'].includes(host);
    const baseURL = isLocalHost ? 'http://localhost:3000' : `https://${host}`;

    const rawRequests = await fetch(`${baseURL}/requests`);
    const requests = await rawRequests.json();

    const result: IRequest[] = [];
    for (const request of requests) {
      const raw = await fetch(`${baseURL}/reports/${request.table.id}`);
      const reports = await raw.json();
      result.push({ table: request.table, reports });
    }

    const rawRegistrants = await fetch(`${baseURL}/registrants`);
    const registrants = await rawRegistrants.json();

    return { requests: result, registrants };
  }

  constructor(props: IHomeProps) {
    super(props);

    this.renderTrendChart = this.renderTrendChart.bind(this);
    this.renderChannelTable = this.renderChannelTable.bind(this);
  }

  public render() {
    const { requests, registrants } = this.props;
    const sortedRequests = requests.sort(dateSort);

    return (
      <Hero color={'white'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns centered>
              <Columns.Column>{this.renderTrendChart(sortedRequests)}</Columns.Column>
            </Columns>
            <Columns centered>
              <Columns.Column>{this.renderChannelTable(registrants)}</Columns.Column>
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
        stats: { passed, total },
        type
      } = getReportStats(r);

      const percentage = total === 0 ? total : (passed / total) * 100;
      const date = new Date(r.table.createdAt).toLocaleDateString();

      const stable = type === api.Channel.STABLE ? percentage : null;
      const beta = type === api.Channel.BETA ? percentage : null;
      const nightly = type === api.Channel.NIGHTLY ? percentage : null;

      return {
        date,
        passed,
        total,
        stable,
        beta,
        nightly,
        type
      };
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

        const formattedType = `${data.type.charAt(0).toUpperCase()}${data.type.slice(1)}`;
        return (
          <div style={style}>
            <p className='label'>{label}</p>
            <p>
              <b>Type:</b> {formattedType}
            </p>
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
      <Box style={{ backgroundColor: '#8996be' }}>
        <Heading size={4} className={'has-text-centered'}>
          Report Statistics
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
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type='monotone'
              dataKey='stable'
              stroke='#000000'
              strokeWidth={2}
              dot={{ stroke: '#000000', strokeWidth: 4 }}
              connectNulls={true}
              activeDot={{ r: 8 }}
            />
            <Line
              type='monotone'
              dataKey='beta'
              stroke='#8A2BE2'
              strokeWidth={2}
              dot={{ stroke: '#8A2BE2', strokeWidth: 4 }}
              connectNulls={true}
              activeDot={{ r: 8 }}
            />
            <Line
              type='monotone'
              dataKey='nightly'
              stroke='#008080'
              strokeWidth={2}
              dot={{ stroke: '#008080', strokeWidth: 4 }}
              connectNulls={true}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  }

  private renderChannelTable(registrants: IRegistrant[]) {
    let stableCount = 0;
    let betaCount = 0;
    let nightlyCount = 0;

    for (const reg of registrants) {
      if (reg.table.channel & api.ReleaseChannel.Stable) stableCount++;
      if (reg.table.channel & api.ReleaseChannel.Beta) betaCount++;
      if (reg.table.channel & api.ReleaseChannel.Nightly) nightlyCount++;
    }

    return (
      <Box style={{ backgroundColor: '#8996be' }}>
        <Table bordered id={'reports-table'}>
          <tbody>
            <tr>
              <th>Channel</th>
              <th>Registrants</th>
              <th>Reports</th>
            </tr>
            <tr>
              <th>Stable</th>
              <td>{stableCount}</td>
              <td>
                <a href={`/channels/${api.Channel.STABLE}`}>Stable Reports</a>
              </td>
            </tr>
            <tr>
              <th>Beta</th>
              <td>{betaCount}</td>
              <td>
                <a href={`/channels/${api.Channel.BETA}`}>Beta Reports</a>
              </td>
            </tr>
            <tr>
              <th>Nightly</th>
              <td>{nightlyCount}</td>
              <td>
                <a href={`/channels/${api.Channel.NIGHTLY}`}>Nightly Reports</a>
              </td>
            </tr>
          </tbody>
        </Table>
      </Box>
    );
  }
}

export default Home;
