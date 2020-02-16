import React, { Component, FormEvent } from 'react'
import Router from 'next/router'
import {
  Container,
  Form,
  Button,
  Hero,
  Columns,
  Box
} from 'react-bulma-components'
import { withAlert, AlertManager } from 'react-alert'

interface IRegistrantState {
  userName: string
  password: string
}

class SignInContainer extends Component<
  { alert: AlertManager },
  { registrant: IRegistrantState }
> {
  constructor(props: { alert: AlertManager }) {
    super(props)

    this.state = {
      registrant: {
        userName: '',
        password: ''
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
      registrant: {
        ...prevState.registrant,
        [prop]: value
      }
    }))
  }

  handleFormSubmit() {
    const alert = this.props.alert
    const userData = this.state.registrant

    fetch('/login', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.status === 200) {
          alert.show(`Successfully Logged In ${userData.userName}`)
          Router.push('/index')
        } else {
          alert.show(`Login Failed For ${userData.userName}`)
        }
      })
      .catch(err => {
        console.log('ERROR: ', err)
      })
  }

  handleClearForm(e: FormEvent<HTMLInputElement>) {
    e.preventDefault()
    this.setState({
      registrant: {
        userName: '',
        password: ''
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
                      value={this.state.registrant.userName}
                      placeholder={'Enter your username'}
                      onChange={this.handleInput}
                    />{' '}
                  </Form.Field>
                  <Form.Field>
                    <Form.Input
                      title={'Password'}
                      name={'password'}
                      type={'password'}
                      value={this.state.registrant.password}
                      placeholder={'Enter your password'}
                      onChange={this.handleInput}
                    />{' '}
                  </Form.Field>
                  <Form.Field>
                    <Button onClick={this.handleClearForm} color={'danger'}>
                      Clear
                    </Button>{' '}
                    <Button onClick={this.handleFormSubmit} color={'success'}>
                      Sign In
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

export default withAlert()(SignInContainer)
