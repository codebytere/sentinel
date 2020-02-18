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
import { withAlert } from 'react-alert'
import { IAlertProps, IRegistrantState } from 'src/server/interfaces'

class SignInContainer extends Component<IAlertProps, IRegistrantState> {
  constructor(props: IAlertProps) {
    super(props)

    this.state = {
      registrant: {
        username: '',
        password: ''
      }
    }

    this.handleFormSubmit = this.handleFormSubmit.bind(this)
    this.handleClearForm = this.handleClearForm.bind(this)
    this.handleInput = this.handleInput.bind(this)
  }

  private handleInput(e: FormEvent<HTMLInputElement>) {
    const prop = e.currentTarget.name
    const value = e.currentTarget.value

    this.setState(prevState => ({
      registrant: {
        ...prevState.registrant,
        [prop]: value
      }
    }))
  }

  private handleFormSubmit() {
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
          alert.show(`Successfully Logged In ${userData.username}`)
          Router.push('/home')
        } else {
          alert.show(`Login Failed For ${userData.username}`)
        }
      })
      .catch(err => {
        console.log('ERROR: ', err)
      })
  }

  private handleClearForm(e: FormEvent<HTMLInputElement>) {
    e.preventDefault()
    this.setState({
      registrant: {
        username: '',
        password: ''
      }
    })
  }

  public render() {
    return (
      <Hero color={'link'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns className={'is-centered'}>
              <Columns.Column size={4}>
                <Box>
                  <Form.Field>
                    <Form.Input
                      title={'User Name'}
                      name={'username'}
                      value={this.state.registrant.username}
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
