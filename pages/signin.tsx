import { Component, FormEvent } from 'react';
import Router from 'next/router';
import {
  Container,
  Form,
  Button,
  Hero,
  Columns,
  Box
} from 'react-bulma-components';
import { withAlert } from 'react-alert';
import { IAlertProps, IRegistrantState } from 'src/server/interfaces';
import { IAuthProviderState, AuthContext } from '../src/contexts/auth';

class SignInContainer extends Component<IAlertProps, IRegistrantState> {
  static contextType = AuthContext;

  constructor(props: IAlertProps) {
    super(props);

    this.state = {
      registrant: {
        username: '',
        password: ''
      }
    };

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleClearForm = this.handleClearForm.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  public render() {
    return (
      <Hero color={'light'} size={'fullheight'}>
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
                    <AuthContext.Consumer>
                      {(auth: IAuthProviderState) => (
                        <Button
                          onClick={() => {
                            this.handleFormSubmit(auth);
                          }}
                          color={'success'}
                        >
                          Sign In
                        </Button>
                      )}
                    </AuthContext.Consumer>
                  </Form.Field>
                </Box>
              </Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    );
  }

  /* PRIVATE METHODS */

  private handleInput(e: FormEvent<HTMLInputElement>) {
    const prop = e.currentTarget.name;
    const value = e.currentTarget.value;

    this.setState(prevState => ({
      registrant: {
        ...prevState.registrant,
        [prop]: value
      }
    }));
  }

  private handleFormSubmit(auth: IAuthProviderState) {
    const alert = this.props.alert;
    const reg = this.state.registrant;

    fetch('/login', {
      method: 'POST',
      body: JSON.stringify(reg),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.status === 200) {
          alert.show(`Successfully Logged In ${reg.username}`);
        } else {
          alert.show(`Login Failed For ${reg.username}`);
        }
        return response.json();
      })
      .then(user => {
        auth.signIn(user);
        Router.push('/index');
      })
      .catch(err => {
        console.log(err);
      });
  }

  private handleClearForm(e: FormEvent<HTMLInputElement>) {
    e.preventDefault();
    this.setState({
      registrant: {
        username: '',
        password: ''
      }
    });
  }
}

export default withAlert()(SignInContainer);
