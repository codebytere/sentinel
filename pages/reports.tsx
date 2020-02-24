import { Component, Fragment } from 'react'
import Dropdown, { Option } from 'react-dropdown'
import { Box, Container, Tile, Section, Level } from 'react-bulma-components'
import { api } from '../src/server/api'
import TestBreakdown from '../src/components/test-breakdown'

interface IReport {
  table: api.Report
  testData: { table: api.TestData }[]
}

interface IReportState {
  platformOptions: string[]
  registrants: string[]
  currentPlatformData?: { table: api.TestData }
  currentReport: IReport
}

const asyncForEach = async (array: any[], callback: Function) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

class Reports extends Component<{ reports: IReport[] }, IReportState> {
  static async getInitialProps({ req }) {
    const id = req.url.replace('/request/', '')

    const result: IReport[] = []

    //TODO(codebytere): make this less nasty?
    const baseURL =
      req.headers.host === 'localhost:3000'
        ? 'http://localhost:3000'
        : `https://${req.headers.host}`
    const rawReports = await fetch(`${baseURL}/reports/${id}`)
    const reports = await rawReports.json()

    await asyncForEach(reports, async (r: IReport) => {
      const raw = await fetch(`${baseURL}/testdata/${r.table.id}`)
      const testData = await raw.json()
      result.push({ table: r.table, testData })
    })

    return { reports: result }
  }

  constructor(props: { reports: IReport[] }) {
    super(props)

    const currentReport = this.props.reports[0]
    const currentPlatformData = currentReport.testData[0]

    const registrants: string[] = []
    this.props.reports.forEach(r => {
      registrants.push(r.table.name)
    })

    const platformOptions: string[] = []
    currentReport.testData.forEach(d => {
      const platform = `${d.table.os}-${d.table.arch}`
      platformOptions.push(platform)
    })

    this.state = {
      currentReport,
      currentPlatformData,
      registrants,
      platformOptions
    }

    this.changePlatform = this.changePlatform.bind(this)
    this.changeReport = this.changeReport.bind(this)

    this.renderDropdowns = this.renderDropdowns.bind(this)
  }

  public render() {
    const { currentReport } = this.state
    console.log(currentReport)

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
    )
  }

  /* PRIVATE METHODS */

  private renderDropdowns() {
    const {
      currentReport,
      registrants,
      currentPlatformData,
      platformOptions
    } = this.state

    let defaultPlatform = 'No Platforms'
    if (currentPlatformData) {
      const { os, arch } = currentPlatformData.table
      defaultPlatform = `${os}-${arch}`
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
    )
  }

  private renderTestData() {
    const { currentReport, currentPlatformData } = this.state

    const time = this.getTimeData()

    return (
      <Container>
        <Tile kind={'ancestor'}>
          <Tile vertical className={'is-7'}>
            <Tile>
              <Tile vertical kind={'parent'}>
                <Tile kind={'child'} notification color={'primary'}>
                  <p className="title">Status</p>
                  <Box>
                    <p className={'subtitle'}>{currentReport.table.status}</p>
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
              <Tile kind={'parent'}>
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
                      href={currentPlatformData!.table.workspaceGzipLink}
                    >
                      Workspace Zipfile
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
    )
  }

  private getTimeData() {
    const { currentPlatformData } = this.state

    const timeStart = new Date(currentPlatformData!.table.timeStart)
    const timeEnd = new Date(currentPlatformData!.table.timeStop)
    const diff = Math.abs(+timeStart - +timeEnd)

    const minutes = Math.floor(diff / 1000 / 60)

    return {
      start: timeStart.toISOString(),
      end: timeEnd.toISOString(),
      total: minutes
    }
  }

  private changePlatform(option: Option) {
    const { currentReport } = this.state
    const currentPlatformData = currentReport.testData.filter(data => {
      const { os, arch } = data.table
      return option.value === `${os}-${arch}`
    })[0]

    this.setState({ currentPlatformData })
  }

  private changeReport(option: Option) {
    const currentReport = this.props.reports.filter(report => {
      return option.value === report.table.name
    })[0]

    // We need to update platform options to reflect the current report.
    const platformOptions: string[] = []
    currentReport.testData.forEach(d => {
      const platform = `${d.table.os}-${d.table.arch}`
      platformOptions.push(platform)
    })

    const hasData = currentReport.testData.length > 0
    const currentPlatformData = hasData ? currentReport.testData[0] : undefined

    this.setState({
      currentReport,
      platformOptions,
      currentPlatformData
    })
  }
}

export default Reports
