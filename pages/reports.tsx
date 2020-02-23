import { Component } from 'react'

import { Table, Hero, Container, Columns } from 'react-bulma-components'
import { api } from '../src/server/api'

interface IReport {
  table: api.Report
  testData: { table: api.TestData[] }[]
}

const asyncForEach = async (array: any[], callback: Function) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

class Reports extends Component<{ reports: IReport[] }, {}> {
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

    this.renderReports = this.renderReports.bind(this)
  }

  public render() {
    console.log('render')
    return (
      <Hero color={'info'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns className={'is-centered'}>
              <Columns.Column>{this.renderReports()}</Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    )
  }

  /* PRIVATE METHODS */

  private renderReports() {
    const reportData = this.props.reports.map(r => {
      const { name, status } = r.table

      return (
        <tr>
          <td>{name}</td>
          <td>{status}</td>
          <td>{r.testData.length}</td>
          <td>TBD</td>
        </tr>
      )
    })

    return (
      <Table bordered id={'reports-table'}>
        <tbody>
          <tr>
            <th>Registrant</th>
            <th>Status</th>
            <th># Platforms Tested</th>
            <th>See Test Data</th>
          </tr>
          {reportData}
        </tbody>
      </Table>
    )
  }
}

export default Reports
