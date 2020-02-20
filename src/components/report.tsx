import { Component, Fragment } from 'react'
import { Box } from 'react-bulma-components'
import { api } from '../server/api'

interface IReportState {
  loading: boolean
  testData?: api.TestData[]
}

interface IReportProps {
  id: string
}

class Report extends Component<IReportProps, IReportState> {
  constructor(props: IReportProps) {
    super(props)

    this.state = { loading: true }

    this.fetchReportTestData = this.fetchReportTestData.bind(this)
    this.renderData = this.renderData.bind(this)
  }

  public render() {
    const haveData = this.state.testData && this.state.testData.length > 0
    return (
      <Box>
        {this.state.loading
          ? 'LOADING'
          : haveData
          ? this.renderData()
          : 'NO DATA'}
      </Box>
    )
  }

  public componentDidMount() {
    this.fetchReportTestData(this.props.id)
  }

  public componentDidUpdate(prevProps: IReportProps) {
    if (prevProps.id !== this.props.id) {
      this.setState({ loading: true })
      this.fetchReportTestData(this.props.id)
    }
  }

  /* PRIVATE METHODS */

  private renderData() {
    const { testData } = this.state
    // TODO(codebytere): figure out the design for this.
    return (
      <Fragment>
        <p>{testData![0].os}</p>
        <p>{testData![0].arch}</p>
        <p>{testData![0].status}</p>
      </Fragment>
    )
  }

  private fetchReportTestData(id: string) {
    fetch(`/testdata/${id}`)
      .then(response => response.json())
      .then(testData => {
        if (testData.length > 0) {
          testData = testData.map(t => t.table)
        }
        this.setState({ loading: false, testData })
      })
  }
}

export default Report
