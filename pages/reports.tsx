import { Component, Fragment } from 'react';
import Dropdown, { Option } from 'react-dropdown';
import { Box, Container, Tile, Section, Level } from 'react-bulma-components';
import TestBreakdown from '../src/components/test-breakdown';
import { mRequest } from 'src/server/database';
import { IReportProps, IReportState, IReport } from 'src/server/interfaces';

class Reports extends Component<IReportProps, IReportState> {
  static async getInitialProps({ req }) {
    const host = req ? req.headers.host : window.location.host;
    const isLocalHost = ['localhost:3000', '0.0.0.0:3000'].includes(host);
    const baseURL = isLocalHost ? 'http://localhost:3000' : `https://${host}`;

    const path = req ? req.url : window.location.pathname;
    const id = path.replace('/request/', '');
    const rawReports = await fetch(`${baseURL}/reports/${id}`);
    const reports = await rawReports.json();

    // The requestId will be the same for any given set of reports, so we can safely
    // pull the requestId off the top of the pile.
    const reqId = reports[0].table.requestId;
    const rawRequest = await fetch(`${baseURL}/requests/${reqId}`);
    const request: mRequest = await rawRequest.json();

    const result: IReport[] = [];
    for (const report of reports) {
      const raw = await fetch(`${baseURL}/testdata/${report.table.id}`);
      const testData = await raw.json();
      result.push({ table: report.table, testData });
    }

    return {
      reports: result,
      versionQualifier: request.table.versionQualifier
    };
  }

  constructor(props: IReportProps) {
    super(props);

    const currentReport = this.props.reports[0];
    const currentPlatformData = currentReport.testData[0];

    const registrants: string[] = [];
    this.props.reports.forEach(r => {
      registrants.push(r.table.name);
    });

    const platformOptions: string[] = [];
    currentReport.testData.forEach(d => {
      const platform = `${d.table.os}-${d.table.arch}`;
      platformOptions.push(platform);
    });

    this.state = {
      currentReport,
      currentPlatformData,
      registrants,
      platformOptions
    };

    this.changePlatform = this.changePlatform.bind(this);
    this.changeReport = this.changeReport.bind(this);

    this.renderDropdowns = this.renderDropdowns.bind(this);
  }

  public render() {
    const { currentReport } = this.state;

    return (
      <Fragment>
        <Section>{this.renderDropdowns()}</Section>
        <Section>
          {currentReport.testData.length > 0 ? (
            this.renderTestData()
          ) : (
            <Box>NO DATA</Box>
          )}
        </Section>
      </Fragment>
    );
  }

  /* PRIVATE METHODS */

  private renderDropdowns() {
    const {
      currentReport,
      registrants,
      currentPlatformData,
      platformOptions
    } = this.state;

    let defaultPlatform = 'No Platforms';
    if (currentPlatformData) {
      const { os, arch } = currentPlatformData.table;
      defaultPlatform = `${os}-${arch}`;
    }

    return (
      <Container>
        <Level>
          <Level.Side align={'left'}>
            <Level.Item>
              <Dropdown
                options={registrants}
                onChange={this.changeReport}
                value={currentReport.table.name}
                placeholder="Select a Platform"
              />
            </Level.Item>
          </Level.Side>
          <Level.Side align={'right'}>
            <Level.Item>
              <Dropdown
                options={platformOptions}
                onChange={this.changePlatform}
                value={defaultPlatform}
                placeholder="Select a Platform"
              />
            </Level.Item>
          </Level.Side>
        </Level>
      </Container>
    );
  }

  private renderTestData() {
    const { currentPlatformData } = this.state;

    const time = this.getTimeData();

    return (
      <Container>
        <Tile kind={'ancestor'}>
          <Tile vertical className={'is-7'}>
            <Tile>
              <Tile vertical kind={'parent'}>
                <Tile kind={'child'} notification color={'primary'}>
                  <p className="title">Status</p>
                  <Box>
                    <p className={'subtitle'}>
                      {currentPlatformData!.table.status}
                    </p>
                  </Box>
                </Tile>
                <Tile kind={'child'} notification color={'danger'}>
                  <p className={'title'}>Timestamp</p>
                  <Box>
                    <ul>
                      <li>
                        <strong>Started at:</strong> {time.start}
                      </li>
                      <li>
                        <strong>Ended at:</strong> {time.end}
                      </li>
                      <li>
                        <strong>Total Elapsed:</strong> {time.total}
                      </li>
                    </ul>
                  </Box>
                </Tile>
              </Tile>
              <Tile vertical kind={'parent'}>
                <Tile kind={'child'} notification color={'warning'}>
                  <p className={'title'}>Version</p>
                  <Box>{this.props.versionQualifier}</Box>
                </Tile>
                <Tile kind={'child'} notification color={'info'}>
                  <p className={'title'}>Links</p>
                  <Box>
                    <a
                      className={'subtitle'}
                      href={currentPlatformData!.table.sourceLink}
                    >
                      Source Files
                    </a>
                  </Box>
                  <Box>
                    <a
                      className={'subtitle'}
                      href={currentPlatformData!.table.ciLink}
                    >
                      CI Output
                    </a>
                  </Box>
                  <Box>
                    <a
                      className={'subtitle'}
                      href={currentPlatformData!.table.logfileLink}
                    >
                      Logfile
                    </a>
                  </Box>
                </Tile>
              </Tile>
            </Tile>
          </Tile>
          <Tile kind={'parent'}>
            <Tile kind={'child'} notification color={'success'}>
              <p className={'title'}>Test Breakdown</p>
              <Box>
                <TestBreakdown data={currentPlatformData!.table} />
              </Box>
            </Tile>
          </Tile>
        </Tile>
      </Container>
    );
  }

  private getTimeData() {
    const { currentPlatformData } = this.state;

    const timeStart = new Date(currentPlatformData!.table.timeStart);
    const timeEnd = new Date(currentPlatformData!.table.timeStop);
    const diff = Math.abs(+timeStart - +timeEnd);

    const minutes = Math.floor(diff / 1000 / 60);

    const formatString = (d: Date) => {
      return d
        .toISOString()
        .slice(0, 19)
        .replace(/-/g, '/')
        .replace('T', ' ');
    };

    return {
      start: formatString(timeStart),
      end: formatString(timeEnd),
      total: minutes
    };
  }

  private changePlatform(option: Option) {
    const { currentReport } = this.state;
    const currentPlatformData = currentReport.testData.filter(data => {
      const { os, arch } = data.table;
      return option.value === `${os}-${arch}`;
    })[0];

    this.setState({ currentPlatformData });
  }

  private changeReport(option: Option) {
    const currentReport = this.props.reports.filter(report => {
      return option.value === report.table.name;
    })[0];

    // We need to update platform options to reflect the current report.
    const platformOptions: string[] = [];
    currentReport.testData.forEach(d => {
      const platform = `${d.table.os}-${d.table.arch}`;
      platformOptions.push(platform);
    });

    const hasData = currentReport.testData.length > 0;
    const currentPlatformData = hasData ? currentReport.testData[0] : undefined;

    this.setState({
      currentReport,
      platformOptions,
      currentPlatformData
    });
  }
}

export default Reports;
