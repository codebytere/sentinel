import React, { Component } from 'react'
import { Hero, Columns, Box, Container } from 'react-bulma-components'
import { AuthContext } from '../src/contexts/auth'
import ReportList from '../src/components/report-list'

interface HomeState {
  reports?: any
  loading: boolean
  // TODO(codebytere) fix type
  selectedReport?: any
}

class Home extends Component<{}, HomeState> {
  static contextType = AuthContext

  constructor(props: any) {
    super(props)

    this.state = { loading: true }

    this.renderReports = this.renderReports.bind(this)
    this.renderReports = this.renderReports.bind(this)
  }

  componentDidMount() {
    this.context.checkSignIn()
    const { user } = this.context

    fetch(`/reports/${user.id}`)
      .then(response => response.json())
      .then(reports => {
        reports = reports.map(r => r.table)
        this.setState({ loading: false, reports })
      })
  }

  private renderReports = () => {
    const reports = this.state.reports
    return (
      <ReportList reports={reports} changeReport={this.selectNewReport} />
    )
  }

  private renderLoading = () => {
    return (
      'LOADING'
    )
  }

  private selectNewReport = (id: string) => {
    if (id) {
      this.setState({
        ...this.state,
        selectedReport: id,
      });
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
                  {this.state.loading ? this.renderLoading() : this.renderReports()}
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
