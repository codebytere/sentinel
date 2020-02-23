import { Component } from 'react'

import { Table, Hero, Container, Columns } from 'react-bulma-components'
import { IReportListProps } from '../src/server/interfaces'
import { api } from '../src/server/api'

interface INightliesState {
  loading: boolean
  // TODO: fix types
  requests?: any //  mRequest[]
}

class Nightlies extends Component<{}, INightliesState> {
  constructor(props: IReportListProps) {
    super(props)

    this.state = { loading: true }

    this.renderRequests = this.renderRequests.bind(this)
  }

  public render() {
    console.log(this.state.loading)
    return (
      <Hero color={'info'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns className={'is-centered'}>
              <Columns.Column>
                {this.state.loading ? 'LOADING' : this.renderRequests()}
              </Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    )
  }

  public componentDidMount() {
    const asyncForEach = async (array: any[], callback: Function) => {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
      }
    }

    // TODO: fix types
    let result: any[] = []
    fetch('/requests/all')
      .then(response => response.json())
      .then(async requests => {
        await asyncForEach(requests, async req => {
          const raw = await fetch(`/reports/${req.table.id}`)
          const reports = await raw.json()
          result.push({ ...req.table, reports })
        })
      })
      .then(() => {
        this.setState({ loading: false, requests: result })
      })
  }

  /* PRIVATE METHODS */

  private renderRequests() {
    // TODO: fix types
    const requestData = this.state.requests!.map(r => {
      const { versionQualifier, id, reports } = r
      const releaseLink = `https://github.com/electron/nightlies/releases/tag/v${versionQualifier}`

      const numReports = reports.length
      const numPassed = reports.filter(
        rep => rep.table.status === api.Status.PASSED
      ).length

      return (
        <tr>
          <td>v{versionQualifier}</td>
          <td>{`${numPassed}/${numReports}`}</td>
          <td>
            <a href={releaseLink}>GitHub Release</a>
          </td>
          <td>
            <a href={`/request/${id}`}>See Reports</a>
          </td>
        </tr>
      )
    })

    return (
      <Table bordered id={'nightlies-table'}>
        <tbody>
          <tr>
            <th>Version</th>
            <th>Status</th>
            <th>Release</th>
            <th>Reports</th>
          </tr>
          {requestData}
        </tbody>
      </Table>
    )
  }
}

export default Nightlies
