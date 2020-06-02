import { Component } from 'react'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Box, Columns, Container, Hero, Table } from 'react-bulma-components'
import { api } from '../src/server/api'
import { IRequest } from 'src/server/interfaces'

const asyncForEach = async (array: any[], callback: Function) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

class Home extends Component<{ requests: IRequest[] }, {}> {
  static async getInitialProps({ req }) {
    const host = req ? req.headers.host : window.location.host
    const isLocalHost = ['localhost:3000', '0.0.0.0:3000'].includes(host)
    const baseURL = isLocalHost ? 'http://localhost:3000' : `https://${host}`

    const rawRequests = await fetch(`${baseURL}/requests`)
    const requests = await rawRequests.json()

    const result: IRequest[] = []
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
            <Columns centered>
              <Columns.Column>{this.renderTrendChart()}</Columns.Column>
            </Columns>
            <Columns centered>
              <Columns.Column>{this.renderRequests()}</Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    )
  }

  /* PRIVATE METHODS */

  private getStatusIcon(passed, total) {
    let statusIcon
    if (total === 0) {
      statusIcon = '🟡'
    } else if (passed === total) {
      statusIcon = '🟢'
    } else {
      statusIcon = '🔴'
    }

    return statusIcon
  }

  private getReportStats (request: IRequest) {
    return { 
      total: request.reports.length,
      passed: request.reports.filter(
        rep => rep.table.status === api.Status.PASSED
      ).length
    }
  }

  private renderTrendChart() {
    const { requests } = this.props

    const data = requests.map(r => {
      const { passed, total } = this.getReportStats(r)

      const percentage = total === 0 ? total : (passed / total) * 100

      const date = new Date(r.table.createdAt)
      return {
        date: date.toLocaleDateString(),
        passed,
        total,
        percentage
      }
    })

    const CustomTooltip = (tooltipData) => {
      const { active, payload, label } = tooltipData

      const style = {
        'background': 'white',
        'border': '2px solid black',
        'padding': '10px',
        'border-radius': '10px'
      }

      if (active) {
        const data = payload[0].payload
        return (
          <div style={style}>
            <p className="label">{label}</p>
            <p>Reports Passed: {data.passed}</p>
            <p>Total Reports: {data.total}</p>
          </div>
        );
      }
    
      return null;
    };

    return (
      <Box>
        <ResponsiveContainer minHeight={'50vh'} width={'95%'}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} tickFormatter={(number) => `${number}%`}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Legend />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke=" #000000"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    )
  }

  private renderRequests() {
    const { requests } = this.props
    const requestData = requests.map(r => {
      const { versionQualifier, id } = r.table
      const releaseLink = `https://github.com/electron/nightlies/releases/tag/v${versionQualifier}`

      const { passed, total } = this.getReportStats(r)

      return (
        <tr>
          <th>{this.getStatusIcon(passed, total)}</th>
          <th>{`${passed}/${total}`}</th>
          <td>
            <a href={releaseLink}>v{versionQualifier}</a>
          </td>
          <td>
            {total > 0 ? (
              <a href={`/request/${id}`}>See Reports</a>
            ) : (
              'No Reports'
            )}
          </td>
        </tr>
      )
    })

    return (
      <Box>
        <Table bordered id={'nightlies-table'}>
          <tbody>
            <tr>
              <th>Status</th>
              <th>Report Count</th>
              <th>Version</th>
              <th>Reports</th>
            </tr>
            {requestData}
          </tbody>
        </Table>
      </Box>
    )
  }
}

export default Home
