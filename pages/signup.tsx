import React, { Component, FormEvent } from 'react'
import {
  Container,
  Form,
  Button,
  Hero,
  Columns,
  Box
} from 'react-bulma-components'
import { withAlert, AlertManager } from 'react-alert'

interface INewRegistrantState {
  userName: string
  appName: string
  password: string
  webhooks: string
}

class SignUpContainer extends Component<
  { alert: AlertManager },
  { newRegistrant: INewRegistrantState }
> {
  constructor(props: any) {
    super(props)

    this.state = {
      newRegistrant: {
        userName: '',
        appName: '',
        password: '',
        webhooks: ''
      }
    }

    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.handleClearForm = this.handleClearForm.bind(this)
    this.handleInput = this.handleInput.bind(this)
  }

  handleInput(e: FormEvent<HTMLInputElement>) {
    const prop = e.currentTarget.name
    const value = e.currentTarget.value

    this.setState(prevState => ({
      newRegistrant: {
        ...prevState.newRegistrant,
        [prop]: value
      }
    }))
  }

  handleFormSubmit() {
    const alert = this.props.alert
    let userData = this.state.newRegistrant
    userData.webhooks = JSON.parse(JSON.stringify(userData.webhooks))

    fetch('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.status === 200) {
          alert.show(`Successfully Registered ${userData.userName}`)
        } else {
          alert.show(`Registration Failed For ${userData.userName}`)
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  handleClearForm(e: FormEvent<HTMLInputElement>) {
    e.preventDefault()
    this.setState({
      newRegistrant: {
        userName: '',
        appName: '',
        password: '',
        // TODO(codebytere): this should be an actual form table
        // with all platforms filled out.
        webhooks: ''
      }
    })
  }

  render() {
    return (
      <Hero color={'primary'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns className={'is-centered'}>
              <Columns.Column size={4}>
                <Box>
                  <Form.Field>
                    <Form.Input
                      title={'User Name'}
                      name={'userName'}
                      value={this.state.newRegistrant.userName}
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
                  <Form.Field>
                    <Form.Input
                      title={'Platforms'}
                      name={'webhooks'}
                      value={this.state.newRegistrant.webhooks}
                      placeholder={'Enter webhooks'}
                      onChange={this.handleInput}
                    />{' '}
                  </Form.Field>
                  <Form.Field>
                    <Button onClick={this.handleClearForm} color={'danger'}>
                      Clear
                    </Button>{' '}
                    <Button onClick={this.handleFormSubmit} color={'success'}>
                      Sign Up
                    </Button>
                  </Form.Field>
                </Box>
              </Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    )
  }
}

export default withAlert()(SignUpContainer)
