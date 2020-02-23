import { Component } from 'react'

import { Table, Hero, Container, Columns } from 'react-bulma-components'
import { api } from '../src/server/api'

interface IRequest {
  table: api.Request
  reports: IReport[]
}

interface IReport {
  table: api.Report
  testData?: { table: api.TestData[] }
}

const asyncForEach = async (array: any[], callback: Function) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

class Nightlies extends Component<{ requests: IRequest[] }, {}> {
  static async getInitialProps({ req }) {
    const result: IRequest[] = []

    //TODO(codebytere): make this less nasty?
    const baseURL =
      req.headers.host === 'localhost:3000'
        ? 'http://localhost:3000'
        : `https://${req.headers.host}`

    const rawRequests = await fetch(`${baseURL}/requests`)
    const requests = await rawRequests.json()

    await asyncForEach(requests, async (req: IRequest) => {
      const raw = await fetch(`${baseURL}/reports/${req.table.id}`)
      const reports = await raw.json()
      result.push({ table: req.table, reports })
    })

    return { requests: result }
  }

  constructor(props: { requests: IRequest[] }) {
    super(props)

    this.renderRequests = this.renderRequests.bind(this)
  }

  public render() {
    return (
      <Hero color={'info'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns className={'is-centered'}>
              <Columns.Column>{this.renderRequests()}</Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    )
  }

  /* PRIVATE METHODS */

  private renderRequests() {
    const requestData = this.props.requests.map(r => {
      const { versionQualifier, id } = r.table
      const releaseLink = `https://github.com/electron/nightlies/releases/tag/v${versionQualifier}`

      const numReports = r.reports.length
      const numPassed = r.reports.filter(
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
            {numReports > 0 ? (
              <a href={`/request/${id}`}>See Reports</a>
            ) : (
              'No Reports'
            )}
          </td>
        </tr>
      )
    })

    return (
      // TODO(codebytere): style this
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
