import { Component } from 'react'
import Router from 'next/router'
import {
  Container,
  Form,
  Button,
  Heading,
  Hero,
  Columns,
  Box,
  Table
} from 'react-bulma-components'
// import { withAlert } from 'react-alert'
import converter from 'html-table-to-json'
import { PLATFORMS } from '../src/server/constants'
import { ISettingsProps, IRegistrant } from 'src/server/interfaces'
import { AuthContext, IAuthProviderState } from '../src/contexts/auth'
import { api } from 'src/server/api'

class Settings extends Component<ISettingsProps, {}> {
  static contextType = AuthContext

  static async getInitialProps({ req }) {
    const host = req ? req.headers.host : window.location.host
    const isLocalHost = ['localhost:3000', '0.0.0.0:3000'].includes(host)
    const baseURL = isLocalHost ? 'http://localhost:3000' : `https://${host}`

    const reply = await fetch(`${baseURL}/currentuser`)
    const json = await reply.json()

    const registrant: IRegistrant = json.table
    const webhooks = registrant.webhooks || null

    return { webhooks, channel: registrant.channel }
  }

  constructor(props: ISettingsProps) {
    super(props)

    this.handleFormSubmit = this.handleFormSubmit.bind(this)
  }

  public render() {
    const { Field } = Form
    const { Body } = Hero
    const { Column } = Columns
    const { Consumer } = AuthContext

    return (
      <Hero color={'light'} size={'fullheight'}>
        <Body>
          <Container>
            <Columns className={'is-centered'}>
              <Column size={6}>
                <Box>
                  <Heading size={3} className={'has-text-centered'}>
                    User Settings
                  </Heading>
                  <Field>{this.renderWebHookTable()}</Field>
                  <Field>{this.renderChannels()}</Field>
                  <Field>
                    <Consumer>
                      {(auth: IAuthProviderState) => (
                        <Button
                          onClick={() => this.handleFormSubmit(auth.user!.name)}
                          color={'success'}
                        >
                          Update Settings
                        </Button>
                      )}
                    </Consumer>
                  </Field>
                </Box>
              </Column>
            </Columns>
          </Container>
        </Body>
      </Hero>
    )
  }

  /* PRIVATE METHODS */

  private handleFormSubmit(regName: string) {
    // const alert = this.props.alert

    const rawTableHTML = document.getElementById('webhook-table')!
    const rawTableString = rawTableHTML.outerHTML.toString()
    const webhooks = this.convertTableToJSON(rawTableString)
    const channel = this.handleChannelCheckboxes()

    fetch('/update', {
      method: 'POST',
      body: JSON.stringify({ webhooks, channel }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        // if (response.status === 200) {
        //   alert.show(`Successfully updated webhooks for ${regName}`)
        // } else {
        //   alert.show(`Failed to update webhooks for ${regName}`)
        // }
        return response.json()
      })
      .then(() => {
        Router.push('/index')
      })
      .catch(err => {
        console.log(err)
      })
  }

  private handleChannelCheckboxes = () => {
    const stable = document.getElementById('stable')! as HTMLInputElement
    const beta = document.getElementById('stable')! as HTMLInputElement
    const nightly = document.getElementById('stable')! as HTMLInputElement

    let channel = api.ReleaseChannel.None

    channel = stable.checked
      ? channel | api.ReleaseChannel.Stable
      : channel & ~api.ReleaseChannel.Stable

    channel = beta.checked
      ? channel | api.ReleaseChannel.Beta
      : channel & ~api.ReleaseChannel.Beta

    channel = nightly.checked
      ? channel | api.ReleaseChannel.Nightly
      : channel & ~api.ReleaseChannel.Nightly

    return channel
  }

  private convertTableToJSON(data: string) {
    const webhookData: Record<string, string> = {}
    const { results: json } = converter.parse(data)
    json[0].forEach((hook: { Platform: string; Webhook: string }) => {
      const [platform, link] = [hook.Platform, hook.Webhook]
      if (link !== '') {
        webhookData[platform] = link
      }
    })
    return webhookData
  }

  private renderChannels() {
    const { channel } = this.props
    const { Control, Checkbox } = Form

    const usingStable = channel & api.ReleaseChannel.Stable
    const usingBeta = channel & api.ReleaseChannel.Beta
    const usingNightly = channel & api.ReleaseChannel.Nightly

    return (
      <Control>
        <Checkbox id={'stable'} checked={usingStable}>
          {' '}
          Stable
        </Checkbox>{' '}
        <Checkbox id={'beta'} checked={usingBeta}>
          {' '}
          Beta
        </Checkbox>{' '}
        <Checkbox id={'nightly'} checked={usingNightly}>
          {' '}
          Nightly
        </Checkbox>
      </Control>
    )
  }

  private renderWebHookTable() {
    const { webhooks } = this.props

    const hooks = PLATFORMS.map(p => {
      const link = webhooks ? webhooks[p] : ''
      return { platform: p, link }
    })

    const hookData = hooks.map(w => {
      const { platform, link } = w
      return (
        <tr>
          <td>{platform}</td>
          <td contentEditable={true} suppressContentEditableWarning={true}>
            {link}
          </td>
        </tr>
      )
    })

    return (
      <Table bordered className={'is-narrow'} id={'webhook-table'}>
        <tbody>
          <tr>
            <th>Platform</th>
            <th>Webhook</th>
          </tr>
          {hookData}
        </tbody>
      </Table>
    )
  }
}

export default Settings
