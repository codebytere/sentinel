import React, { Component } from 'react'
import { Hero, Columns, Box, Container } from 'react-bulma-components'
import { AuthContext } from '../src/contexts/auth'
import ReportList from '../src/components/report-list'
import { HomeState } from '../src/server/interfaces'

class Home extends Component<{}, HomeState> {
  static contextType = AuthContext

  constructor(props: any) {
    super(props)

    this.state = { loading: true }

    this.renderReports = this.renderReports.bind(this)
    this.renderLoading = this.renderLoading.bind(this)
  }

  componentDidMount() {
    // TODO(codebytere): this feels very bad. can it be improved?
    fetch('/checkAuth')
      .then(response => response.json())
      .then(user => {
        fetch(`/reports/${user.id}`)
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

  private renderReports = () => {
    const reports = this.state.reports
    return <ReportList reports={reports} changeReport={this.selectNewReport} />
  }

  private renderLoading = () => {
    return 'LOADING'
  }

  private selectNewReport = (id: string) => {
    if (id) {
      this.setState({
        ...this.state,
        selectedReport: id
      })
    }
  }

  render() {
    return (
      <Hero color={'primary'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns className={'is-centered'}>
              <Columns.Column size={9}>
                <Box>
                  {this.state.loading
                    ? this.renderLoading()
                    : this.renderReports()}
                </Box>
              </Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    )
  }
}

export default Home
