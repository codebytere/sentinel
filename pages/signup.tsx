import { FormEvent, Component } from 'react'
import Router from 'next/router'
import {
  Container,
  Form,
  Button,
  Hero,
  Columns,
  Box,
  Table
} from 'react-bulma-components'
import { withAlert } from 'react-alert'
import converter from 'html-table-to-json'
import { PLATFORMS } from '../src/server/constants'
import {
  IAlertProps as ISignupProps,
  ISignupState
} from 'src/server/interfaces'
import { IAuthProviderState, AuthContext } from '../src/contexts/auth'

class SignUpContainer extends Component<ISignupProps, ISignupState> {
  static contextType = AuthContext

  constructor(props: ISignupProps) {
    super(props)

    this.state = {
      newRegistrant: {
        username: '',
        appName: '',
        password: ''
      }
    }

    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.handleClearForm = this.handleClearForm.bind(this)
    this.handleInput = this.handleInput.bind(this)
  }

  public render() {
    return (
      <Hero color={'primary'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns className={'is-centered'}>
              <Columns.Column size={6}>
                <Box>
                  <Form.Field>
                    <Form.Input
                      title={'User Name'}
                      name={'username'}
                      value={this.state.newRegistrant.username}
                      placeholder={'Enter your name'}
                      onChange={this.handleInput}
                    />{' '}
                  </Form.Field>
                  <Form.Field>
                    <Form.Input
                      title={'App Name'}
                      name={'appName'}
                      value={this.state.newRegistrant.appName}
                      placeholder={`Enter your app's name`}
                      onChange={this.handleInput}
                    />{' '}
                  </Form.Field>
                  <Form.Field>
                    <Form.Input
                      title={'Password'}
                      name={'password'}
                      type={'password'}
                      value={this.state.newRegistrant.password}
                      placeholder={'Enter a new password'}
                      onChange={this.handleInput}
                    />{' '}
                  </Form.Field>
                  <Form.Field>{this.renderWebHookTable()}</Form.Field>
                  <Form.Field>
                    <Button onClick={this.handleClearForm} color={'danger'}>
                      Clear
                    </Button>{' '}
                    {(auth: IAuthProviderState) => (
                      <Button
                        onClick={() => this.handleFormSubmit(auth)}
                        color={'success'}
                      >
                        Sign Up
                      </Button>
                    )}
                  </Form.Field>
                </Box>
              </Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    )
  }

  /* PRIVATE METHODS */

  private handleInput(e: FormEvent<HTMLInputElement>) {
    const prop = e.currentTarget.name
    const value = e.currentTarget.value

    this.setState(prevState => ({
      newRegistrant: {
        ...prevState.newRegistrant,
        [prop]: value
      }
    }))
  }

  private handleFormSubmit(auth: IAuthProviderState) {
    const alert = this.props.alert
    const reg = this.state.newRegistrant

    const rawTableHTML = document.getElementById('webhook-table')!
    const rawTableString = rawTableHTML.outerHTML.toString()
    reg.webhooks = this.convertTableToJSON(rawTableString)

    fetch('/register', {
      method: 'POST',
      body: JSON.stringify(reg),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.status === 200) {
          alert.show(`Successfully Registered ${reg.username}`)
        } else {
          alert.show(`Registration Failed For ${reg.username}`)
        }
        return response.json()
      })
      .then(user => {
        auth.signIn(user)
        Router.push('/home')
      })
      .catch(err => {
        console.log(err)
      })
  }

  private handleClearForm(event: FormEvent<HTMLInputElement>) {
    event.preventDefault()
    this.setState({
      newRegistrant: {
        username: '',
        appName: '',
        password: ''
      }
    })
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

  private renderWebHookTable() {
    const hooks = PLATFORMS.map(p => {
      return { platform: p, link: '' }
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

export default withAlert()(SignUpContainer)
