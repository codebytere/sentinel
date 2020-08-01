import { Component, Fragment } from 'react';
import {
  Box,
  Columns,
  Container,
  Heading,
  Hero,
  Navbar,
  Table,
  Tag
} from 'react-bulma-components';
import { mRequest } from 'src/server/database';
import { IReportProps, IReport } from 'src/server/interfaces';
import { api } from 'src/server/api';

class Reports extends Component<IReportProps, {}> {
  static async getInitialProps({ req }) {
    const host = req ? req.headers.host : window.location.host;
    const isLocalHost = ['localhost:3000', '0.0.0.0:3000'].includes(host);
    const baseURL = isLocalHost ? 'http://localhost:3000' : `https://${host}`;

    const path = req ? req.url : window.location.pathname;
    const [channel, date] = path.replace('/channels/', '').split('/');
    const rawReports = await fetch(`${baseURL}/reports/${channel}/${date}`);
    const reports = await rawReports.json();

    // requestId will be the same for any given set of Reports.
    const reqId = reports[0].table.requestId;
    const rawRequest = await fetch(`${baseURL}/requests/${reqId}`);
    const request: mRequest = await rawRequest.json();
    const versionQualifier = request.table.versionQualifier;

    return { reports, channel, date, versionQualifier };
  }

  constructor(props: IReportProps) {
    super(props);

    this.renderReports = this.renderReports.bind(this);
  }

  public render() {
    const { reports, channel, date } = this.props;

    return (
      <Hero color={'white'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns centered>
              <Columns.Column>{this.renderBreadcrumb(channel, date)}</Columns.Column>
            </Columns>
            <Columns centered>
              <Columns.Column>{this.renderReports(reports)}</Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    );
  }

  /* PRIVATE METHODS */

  private renderBreadcrumb(channel: string, date: string) {
    const formattedChannel = channel[0].toUpperCase() + channel.slice(1);

    return (
      <Navbar.Container className={'breadcrumb is-medium has-arrow-separator'}>
        <ul>
          <li>
            <a href={'/index'}>Home</a>
          </li>
          <li>
            <a href={`/channels/${channel}`}>{formattedChannel}</a>
          </li>
          <li className='is-active'>
            <a href={`/channels/${channel}/${date}`} aria-current='page'>
              {date}
            </a>
          </li>
        </ul>
      </Navbar.Container>
    );
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

  private renderReports(reports: IReport[]) {
    const { versionQualifier } = this.props;

    const reportData: JSX.Element[] = [];
    for (const report of reports) {
      const { name } = report.table;
      // @ts-expect-error - TS is not aware of the join.
      const testData: api.TestData[] = report.table.TestData;

      for (const td of testData) {
        const status = this.getStatusButton(td.status);
        reportData.push(
          <tr>
            <th>{name}</th>
            <th>{status}</th>
            <th>{`${td.os}-${td.arch}`}</th>
            <th>{`${td.totalPassed!}/${td.totalTests!}`}</th>
            <th>{td.logfileLink ? <a href={td.logfileLink}>Log</a> : 'No Logfile'}</th>
            <th>{td.ciLink ? <a href={td.ciLink}>CI</a> : 'No CI Link'}</th>
          </tr>
        );
      }
    }

    return (
      <Fragment>
        <Box style={{ backgroundColor: '#FF9999' }}>
          <Heading size={5} className={'has-text-centered'}>
            {versionQualifier}
          </Heading>
          <div
            className={'table-container'}
            style={{ overflowY: 'auto', maxHeight: '100vh', borderRadius: '8px' }}
          >
            <Table bordered className={'is-hoverable'}>
              <tbody>
                <tr>
                  <th>App Name</th>
                  <th>Status</th>
                  <th>Platform</th>
                  <th>Tests Passed</th>
                  <th>Logfile</th>
                  <th>CI Run</th>
                </tr>
                {reportData}
              </tbody>
            </Table>
          </div>
        </Box>
      </Fragment>
    );
  }
}

export default Reports;
