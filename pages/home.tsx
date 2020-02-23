import React, { Component } from 'react'
import { Hero, Columns, Container } from 'react-bulma-components'
import { AuthContext } from '../src/contexts/auth'
import ReportList from '../src/components/report-list'
import Report from '../src/components/report'
import { HomeState } from '../src/server/interfaces'

class Home extends Component<{}, HomeState> {
  static contextType = AuthContext

  constructor(props: any) {
    super(props)

    this.state = { loading: true }

    this.renderReports = this.renderReports.bind(this)
    this.renderReport = this.renderReport.bind(this)
    this.selectNewReport = this.selectNewReport.bind(this)
    this.fetchReportListData = this.fetchReportListData.bind(this)
  }

  public render() {
    return (
      <Hero color={'primary'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns className={'is-centered'}>
              <Columns.Column size={9}>
                {this.state.loading ? 'LOADING' : this.renderReports()}
                {this.state.selectedReport ? this.renderReport() : ''}
              </Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    )
  }

  public componentDidMount() {
    this.fetchReportListData()
  }

  /* PRIVATE METHODS */

  private fetchReportListData() {
    this.context
      .fetchAuthedUser()
      .then(user => {
        fetch(`/reports/registrant/${user.id}`)
          .then(response => response.json())
          .then(reports => {
            reports = reports.map(r => r.table)
            this.setState({ loading: false, reports })
          })
      })
      .catch(err => {
        console.log(err)
      })
  }

  private renderReports() {
    const { reports } = this.state
    return <ReportList reports={reports} changeReport={this.selectNewReport} />
  }

  private renderReport() {
    const { selectedReport } = this.state
    if (selectedReport) {
      return <Report id={selectedReport} />
    }
  }

  private selectNewReport(id: string) {
    if (id) {
      this.setState({ selectedReport: id })
    }
  }
}

export default Home
