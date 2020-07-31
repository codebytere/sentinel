import { Component } from 'react';
import { Box, Columns, Container, Hero, Table } from 'react-bulma-components';
import { mRequest } from 'src/server/database';
import { IReportProps, IReport } from 'src/server/interfaces';
import { getStatusIcon } from 'src/utils/report-helpers';
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

    // The requestId will be the same for any given set of reports, so we can safely
    // pull the requestId off the top of the pile.
    let request: mRequest | null = null;
    if (reports.length > 0) {
      const reqId = reports[0].table.requestId;
      const rawRequest = await fetch(`${baseURL}/requests/${reqId}`);
      request = await rawRequest.json();
    }

    return {
      reports,
      versionQualifier: request ? request.table.versionQualifier : ''
    };
  }

  constructor(props: IReportProps) {
    super(props);

    this.renderReports = this.renderReports.bind(this);
  }

  public render() {
    const { reports } = this.props;

    return (
      <Hero color={'white'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns centered>
              <Columns.Column>{this.renderReports(reports)}</Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    );
  }

  /* PRIVATE METHODS */

  private renderReports(reports: IReport[]) {
    const reportData: JSX.Element[] = [];

    for (const report of reports) {
      const { name } = report.table;
      // @ts-expect-error - TS is not aware of the join.
      const testData: api.TestData[] = report.table.TestData;

      for (const td of testData) {
        const icon = getStatusIcon(td.totalFailed!, td.totalTests!);
        reportData.push(
          <tr>
            <th>{name}</th>
            <th>{`${icon} - ${td.status}`}</th>
            <th>{`${td.os}-${td.arch}`}</th>
            <th>{`${td.totalPassed!}/${td.totalTests!}`}</th>
            <th>
              {td.logfileLink ? <a href={td.logfileLink}>Log</a> : 'No Logfile'}
            </th>
            <th>{td.ciLink ? <a href={td.ciLink}>CI</a> : 'No CI Link'}</th>
          </tr>
        );
      }
    }

    return (
      <Box style={{ backgroundColor: '#FF9999' }}>
        <Table bordered id={'reports-table'}>
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
      </Box>
    );
  }
}

export default Reports;
