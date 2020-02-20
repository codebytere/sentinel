import { Component, FormEvent } from 'react'

import { Panel } from 'react-bulma-components'
import { IReportListProps, IReportInfo } from '../server/interfaces'

interface IReportListState {
  reports: IReportInfo[]
}

class ReportList extends Component<IReportListProps, IReportListState> {
  constructor(props: IReportListProps) {
    super(props)

    this.performChange = this.performChange.bind(this)
    this.filterReports = this.filterReports.bind(this)
    this.state = { reports: this.props.reports }
  }

  public render() {
    return (
      <Panel color="info">
        <Panel.Header>Reports</Panel.Header>
        <Panel.Block className="contact-search">
          <input
            type="text"
            className="input is-medium"
            placeholder="Search"
            onChange={this.filterReports}
          />
        </Panel.Block>
        {this.state.reports.map((r: IReportInfo) => this.renderReport(r))}
      </Panel>
    )
  }

  public componentDidMount() {
    this.setState({ reports: this.props.reports })
  }

  /* PRIVATE METHODS */

  private filterReports(e: FormEvent<HTMLInputElement>) {
    let updated: IReportInfo[] = []

    if (e.currentTarget.value !== '') {
      updated = this.props.reports.filter(r => {
        const name = r.name.toLowerCase()
        const target = e.currentTarget.value.toLowerCase()
        return name.includes(target)
      })
    } else {
      updated = this.props.reports
    }

    this.setState({ reports: updated })
  }

  private renderReport(r: IReportInfo) {
    return (
      <Panel.Block>
        <a id={r.id.toString()} onClick={this.performChange}>
          {r.name}
        </a>
      </Panel.Block>
    )
  }

  private performChange(e: any) {
    if (e.target) {
      const id = e.target.id
      this.props.changeReport(id)
    }
  }
}

export default ReportList
