import React, { Component, Fragment } from 'react';
import {
  Box,
  Breadcrumb,
  Columns,
  Container,
  Heading,
  Hero,
  Table,
  Tag
} from 'react-bulma-components';
import { mRequest, mReport } from 'src/server/database';
import { IReportProps, IReport } from 'src/server/interfaces';
import { api } from 'src/server/api';
import { NextApiRequest } from 'next';
import { getBaseURL } from 'src/utils';
import { DATA_AUTH_TOKEN } from 'src/server/constants';

class Reports extends Component<IReportProps, {}> {
  static async getInitialProps({ req }: { req: NextApiRequest | null }) {
    const baseURL = getBaseURL(req);
    let reports: mReport[] = [];
    let versionQualifier = '';
    let request: mRequest;

    const path = req?.url ? req.url : window.location.pathname;
    const [channel, date] = path.replace('/channels/', '').split('/');

    try {
      const rawReports = await fetch(`${baseURL}/reports/${channel}/${date}`, {
        headers: { authorization: DATA_AUTH_TOKEN }
      });
      reports = await rawReports.json();

      // requestId will be the same for any given set of Reports.
      const reqId = reports[0].table.requestId;
      const rawRequest = await fetch(`${baseURL}/requests/${reqId}`, {
        headers: { authorization: DATA_AUTH_TOKEN }
      });
      request = await rawRequest.json();
      versionQualifier = request.table.versionQualifier;
    } catch (error) {
      console.error(error);
    }

    return { reports, channel, date, versionQualifier };
  }

  constructor(props: IReportProps) {
    super(props);

    this.renderReports = this.renderReports.bind(this);
  }

  public render() {
    const { reports, channel, date } = this.props;
    const { Body } = Hero;
    const { Column } = Columns;

    return (
      <Hero color={'white'} size={'fullheight'}>
        <Body>
          <Container>
            <Columns centered>
              <Column>{this.renderBreadcrumb(channel, date)}</Column>
            </Columns>
            <Columns centered>
              <Column>{this.renderReports(reports)}</Column>
            </Columns>
          </Container>
        </Body>
      </Hero>
    );
  }

  /* PRIVATE METHODS */

  private renderBreadcrumb(channel: string, date: string) {
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
            url: `/channels/${channel}`
          },
          {
            name: date,
            url: `/channels/${channel}/${date}`,
            active: true
          }
        ]}
      ></Breadcrumb>
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
      const testData: api.TestData[] = report.table.TestData!;

      for (const td of testData) {
        const status = this.getStatusButton(td.status);
        reportData.push(
          <tr>
            <th>
              <a href={`/registrants/${name}`}>{name}</a>
            </th>
            <th>{status}</th>
            <th>{td.os}</th>
            <th>{td.arch}</th>
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
                  <th>OS</th>
                  <th>Arch</th>
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
