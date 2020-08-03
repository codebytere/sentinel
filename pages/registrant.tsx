import { Component } from 'react';

import { Box, Columns, Container, Heading, Hero, Table, Tag } from 'react-bulma-components';
import { IRequest, IRegistrantProps } from 'src/server/interfaces';
import { api } from 'src/server/api';
import { getBaseURL, getChannelForVersion, formatDateString } from 'src/utils';
import { NextApiRequest } from 'next';

class Registrant extends Component<IRegistrantProps, {}> {
  static async getInitialProps({ req }: { req: NextApiRequest | null }) {
    const baseURL = getBaseURL(req);

    const path = req?.url ? req.url : window.location.pathname;
    const [name] = path.replace('/registrants/', '').split('/');

    const rawRegistrant = await fetch(`${baseURL}/registrant/data/${name}`);
    const registrant: IRequest[] = await rawRegistrant.json();

    return { registrant };
  }

  public render() {
    const { Body } = Hero;
    const { Column } = Columns;

    return (
      <Hero color={'white'} size={'fullheight'}>
        <Body>
          <Container>
            <Columns centered>
              <Column>{this.renderChannelTable()}</Column>
            </Columns>
          </Container>
        </Body>
      </Hero>
    );
  }

  /* PRIVATE METHODS */

  private getDataForChannel(channel: api.Channel) {
    const { registrant } = this.props;

    const result = {
      passRate: 'N/A',
      status: api.Status.NOT_RUN,
      lastRun: 'N/A',
      totalReports: 0
    };

    // @ts-expect-error - TS is not aware of the join.
    const reports: api.Report[] = registrant.table.Reports;

    const sortedReports: api.Report[] = reports
      .sort((r1, r2) => {
        const d1 = new Date(r1.createdAt);
        const d2 = new Date(r2.createdAt);

        return d1 > d2 ? 1 : d1 < d2 ? -1 : 0;
      })
      .filter(r => {
        // @ts-expect-error - TS is not aware of the join.
        return channel === getChannelForVersion(r.Request.versionQualifier);
      });

    const passes = reports.filter((r: api.Report) => {
      const passed = r.status === api.Status.PASSED;
      // @ts-expect-error - TS is not aware of the join.
      const matchesChannel = channel === getChannelForVersion(r.Request.versionQualifier);
      return passed && matchesChannel;
    }).length;

    result.passRate = `${Math.floor((100 * passes) / reports.length)}%`;

    if (sortedReports.length > 0) {
      result.status = sortedReports[0].status;
      result.lastRun = formatDateString(new Date(sortedReports[0].createdAt));
      result.totalReports = sortedReports.length;
    }

    return result;
  }

  private getStatusButton(status: api.Status) {
    const buttonTypes = {
      [api.Status.PASSED]: 'success',
      [api.Status.FAILED]: 'danger',
      [api.Status.NOT_RUN]: 'info',
      [api.Status.PENDING]: 'warning'
    };

    const color = buttonTypes[status];
    return (
      <Tag size={'medium'} color={color}>
        {status}
      </Tag>
    );
  }

  private renderChannelTable() {
    const { registrant } = this.props;

    const {
      passRate: stableRate,
      status: stableStatus,
      totalReports: stableReportCount,
      lastRun: stableDate
    } = this.getDataForChannel(api.Channel.STABLE);
    const {
      passRate: betaRate,
      status: betaStatus,
      totalReports: betaReportCount,
      lastRun: betaDate
    } = this.getDataForChannel(api.Channel.BETA);
    const {
      passRate: nightlyRate,
      status: nightlyStatus,
      totalReports: nightlyReportCount,
      lastRun: nightlyDate
    } = this.getDataForChannel(api.Channel.NIGHTLY);

    return (
      <Box style={{ backgroundColor: '#00CCCC' }}>
        <Heading size={5} className={'has-text-centered'}>
          {registrant.table.appName}
        </Heading>
        <Table bordered id={'reports-table'}>
          <tbody>
            <tr>
              <th>Channel</th>
              <th>Average Pass Rate</th>
              <th>Latest Status</th>
              <th>Most Recent Run</th>
              <th>Total Reports</th>
            </tr>
            <tr>
              <th>Stable</th>
              <td>{stableRate}</td>
              <td>{this.getStatusButton(stableStatus)}</td>
              <td>
                {stableDate !== 'N/A' ? (
                  <a href={`/channels/stable/${stableDate}`}>{stableDate}</a>
                ) : (
                  'N/A'
                )}
              </td>
              <td>{stableReportCount}</td>
            </tr>
            <tr>
              <th>Beta</th>
              <td>{betaRate}</td>
              <td>{this.getStatusButton(betaStatus)}</td>
              <td>
                {betaDate !== 'N/A' ? <a href={`/channels/beta/${betaDate}`}>{betaDate}</a> : 'N/A'}
              </td>
              <td>{betaReportCount}</td>
            </tr>
            <tr>
              <th>Nightly</th>
              <td>{nightlyRate}</td>
              <td>{this.getStatusButton(nightlyStatus)}</td>
              <td>
                {nightlyDate !== 'N/A' ? (
                  <a href={`/channels/nightly/${nightlyDate}`}>{nightlyDate}</a>
                ) : (
                  'N/A'
                )}
              </td>
              <td>{nightlyReportCount}</td>
            </tr>
          </tbody>
        </Table>
      </Box>
    );
  }
}

export default Registrant;
