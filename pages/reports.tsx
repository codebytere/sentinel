import { Component, Fragment } from 'react'
import Dropdown, { Option } from 'react-dropdown'
import { Container, Tile, Section, Level } from 'react-bulma-components'
import { api } from '../src/server/api'

interface IReport {
  table: api.Report
  testData: { table: api.TestData }[]
}

interface IReportState {
  platformOptions: string[]
  registrants: string[]
  currentPlatformData: { table: api.TestData }
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
    const { currentReport, currentPlatformData } = this.state

    return (
      <Fragment>
        <Section>
          {this.renderDropdowns()}
        </Section>
        <Section>
          <Container>
            <Tile kind={'ancestor'}>
              <Tile className=" is-vertical is-8">
                <Tile>
                  <Tile vertical kind={'parent'}>
                    <Tile kind={'child'} notification color={'primary'}>
                      <p className="title">Status</p>
                      <p className="subtitle">{currentReport.table.status}</p>
                    </Tile>
                    <Tile kind={'child'} notification color={'warning'}>
                      <p className="title">...tiles</p>
                      <p className="subtitle">Bottom tile</p>
                    </Tile>
                  </Tile>
                  <Tile kind={'parent'}>
                    <Tile kind={'child'} notification color={'info'}>
                      <p className="title">Middle tile</p>
                      <p className="subtitle">With an image</p>
                      <figure className="image is-4by3">
                        <img src="https://bulma.io/images/placeholders/640x480.png" />
                      </figure>
                    </Tile>
                  </Tile>
                </Tile>
                <Tile vertical kind={'parent'}>
                  <Tile kind={'child'} notification color={'danger'}>
                    <p className="title">Links</p>
                    <a href={currentPlatformData.table.sourceLink}>Source</a>
                    <a href={currentPlatformData.table.ciLink}>Continuous Integration</a>
                    <a href={currentPlatformData.table.workspaceGzipLink}>Workspace GZip</a>
                    <p className="subtitle">Aligned with the right tile</p>
                    <div className="content">CONTENT</div>
                  </Tile>
                </Tile>
              </Tile>
              <Tile kind={'parent'}>
                <Tile kind={'child'} notification color={'success'}>
                  <div className="content">
                    <p className="title">Test Breakdown</p>
                    <p className="subtitle">With even more content</p>
                    <div className="content">
                      <p className="subtitle">Total Passed: {currentPlatformData.table.totalPassed}</p>
                      <p className="subtitle">Total Failed: {currentPlatformData.table.totalFailed}</p>
                      <p className="subtitle">Total Skipped: {currentPlatformData.table.totalSkipped}</p>
                      <p className="subtitle">Total Aborted: {currentPlatformData.table.totalAborted}</p>
                      <p className="subtitle">Total Warnings: {currentPlatformData.table.totalWarnings}</p>
                    </div>
                  </div>
                </Tile>
              </Tile>
            </Tile>
          </Container>
        </Section>
      </Fragment>
    )
  }

  /* PRIVATE METHODS */

  private renderDropdowns() {
    const { currentReport, registrants, currentPlatformData, platformOptions } = this.state
    const { os, arch } = currentPlatformData.table

    return (
      <Container>
        <Level>
          <Level.Side align={'left'}>
            <Level.Item>
              <Dropdown options={registrants} onChange={this.changeReport} value={currentReport.table.name} placeholder="Select a Platform" />
            </Level.Item>
          </Level.Side>

          <Level.Side align={'right'}>
            <Level.Item>
            <Dropdown options={platformOptions} onChange={this.changePlatform} value={`${os}-${arch}`} placeholder="Select a Platform" />
            </Level.Item>
          </Level.Side>
        </Level>
      </Container>
    )
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

    this.setState({ currentReport, platformOptions })
  }
}

export default Reports
