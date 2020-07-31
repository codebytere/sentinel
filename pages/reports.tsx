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

  private aggregateTestData(data: api.TestData[]) {
    const result = {
      platformsPassed: 0,
      platformsRun: 0,
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    };

    data.map((td: api.TestData) => {
      result.platformsRun += 1;
      if (td.status === api.Status.PASSED) {
        result.platformsPassed += 1;
      }

      result.total += td.totalTests ? td.totalTests : 0;
      result.passed += td.totalPassed ? td.totalPassed : 0;
      result.failed += td.totalFailed ? td.totalFailed : 0;
      result.warnings += td.totalWarnings ? td.totalWarnings : 0;
    });

    return result;
  }

  private renderReports(reports: IReport[]) {
    const reportData = reports.map(r => {
      const { name, status } = r.table;

      // @ts-ignore - TS is not aware of the join.
      const aggregated = this.aggregateTestData(r.table.TestData);
      const icon = getStatusIcon(aggregated.failed, aggregated.total);

      return (
        <tr>
          <th>{name}</th>
          <th>{`${icon} - ${status}`}</th>
          <th>{`${aggregated.platformsPassed}/${aggregated.platformsRun}`}</th>
          <th>{`${aggregated.passed}/${aggregated.total}`}</th>
          <th>TODO</th>
        </tr>
      );
    });

    return (
      <Box style={{ backgroundColor: '#FF9999' }}>
        <Table bordered id={'reports-table'}>
          <tbody>
            <tr>
              <th>App Name</th>
              <th>Status</th>
              <th>Platforms Passed</th>
              <th>Tests Passed</th>
              <th>Reports</th>
            </tr>
            {reportData}
          </tbody>
        </Table>
      </Box>
    );
  }
}

export default Reports;
