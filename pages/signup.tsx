import { FormEvent, Component } from 'react';
import Router from 'next/router';
import {
  Container,
  Form,
  Heading,
  Button,
  Hero,
  Columns,
  Box,
  Table
} from 'react-bulma-components';
import { withAlert } from 'react-alert';
import converter from 'html-table-to-json';
import { PLATFORMS } from '../src/server/constants';
import { api } from '../src/server/api';
import { IAlertProps as ISignupProps, ISignupState } from 'src/server/interfaces';
import { IAuthProviderState, AuthContext } from '../src/contexts/auth';

class SignUpContainer extends Component<ISignupProps, ISignupState> {
  static contextType = AuthContext;

  constructor(props: ISignupProps) {
    super(props);

    this.state = {
      newRegistrant: {
        username: '',
        appName: '',
        password: '',
        channel: api.ReleaseChannel.None
      }
    };

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleClearForm = this.handleClearForm.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.onInputCheckboxChange = this.onInputCheckboxChange.bind(this);
  }

  public render() {
    const { Consumer } = AuthContext;
    const { Column } = Columns;
    const { Input, Field, Control, Checkbox } = Form;
    const { Body } = Hero;

    return (
      <Hero color={'light'} size={'fullheight'}>
        <Body>
          <Container>
            <Columns className={'is-centered'}>
              <Column size={6}>
                <Box className={'has-background-link-light'}>
                  <Heading size={4} className={'has-text-centered'}>
                    User Information
                  </Heading>
                  <Field>
                    <Input
                      title={'User Name'}
                      name={'username'}
                      value={this.state.newRegistrant.username}
                      placeholder={'Enter your name'}
                      onChange={this.handleInput}
                    />{' '}
                  </Field>
                  <Field>
                    <Input
                      title={'App Name'}
                      name={'appName'}
                      value={this.state.newRegistrant.appName}
                      placeholder={`Enter your app's name`}
                      onChange={this.handleInput}
                    />{' '}
                  </Field>
                  <Field>
                    <Input
                      title={'Password'}
                      name={'password'}
                      type={'password'}
                      value={this.state.newRegistrant.password}
                      placeholder={'Enter a new password'}
                      onChange={this.handleInput}
                    />{' '}
                  </Field>
                  <Heading size={4} className={'has-text-centered tooltip'}>
                    Webhooks
                    <span className={'tooltiptext'}>
                      Where should Sentinel send webhooks for each platform?
                    </span>
                  </Heading>
                  <Field kind={'group'} align={'centered'}>
                    <Control>
                      <Checkbox id={'use-provided-client'} onChange={this.onInputCheckboxChange}>
                        {' '}
                        Use Default Client
                      </Checkbox>
                    </Control>
                  </Field>
                  <Field>{this.renderWebHookTable()}</Field>
                  <Heading size={4} className={'has-text-centered tooltip'}>
                    Release Channels
                    <span className={'tooltiptext'}>
                      What release lines do you want to test against?
                    </span>
                  </Heading>
                  <Field kind={'group'} align={'centered'}>
                    <Control>
                      <Checkbox id={'stable'} onChange={this.onInputCheckboxChange}>
                        {' '}
                        Stable
                      </Checkbox>{' '}
                      <Checkbox id={'beta'} onChange={this.onInputCheckboxChange}>
                        {' '}
                        Beta{' '}
                      </Checkbox>{' '}
                      <Checkbox id={'nightly'} onChange={this.onInputCheckboxChange}>
                        {' '}
                        Nightly
                      </Checkbox>
                    </Control>
                  </Field>
                  <Field kind={'group'} align={'centered'}>
                    <Control>
                      <Button onClick={this.handleClearForm} color={'danger'}>
                        Clear
                      </Button>
                    </Control>
                    <Control>
                      <Consumer>
                        {(auth: IAuthProviderState) => (
                          <Button onClick={() => this.handleFormSubmit(auth)} color={'success'}>
                            Sign Up
                          </Button>
                        )}
                      </Consumer>
                    </Control>
                  </Field>
                </Box>
              </Column>
            </Columns>
          </Container>
        </Body>
      </Hero>
    );
  }

  /* PRIVATE METHODS */

  private handleInput(e: FormEvent<HTMLInputElement>) {
    const prop = e.currentTarget.name;
    const value = e.currentTarget.value;

    this.setState(prevState => ({
      newRegistrant: {
        ...prevState.newRegistrant,
        [prop]: value
      }
    }));
  }

  private handleFormSubmit(auth: IAuthProviderState) {
    const alert = this.props.alert;
    const reg = this.state.newRegistrant;

    reg.webhooks = this.getWebhookData();

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
          alert.show(`Successfully Registered ${reg.username}`);
        } else {
          alert.show(`Registration Failed For ${reg.username}`);
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

  private handleClearForm(event: FormEvent<HTMLInputElement>) {
    event.preventDefault();
    this.setState({
      newRegistrant: {
        username: '',
        appName: '',
        password: '',
        channel: api.ReleaseChannel.None
      }
    });
  }

  private onInputCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { channel } = this.state.newRegistrant;

    const id = event.target.id;
    const checked = event.target.checked;

    if (id === 'use-provided-client') {
      const table = document.getElementById('webhook-table')!;
      table.style.display = checked ? 'none' : '';
      return;
    }

    if (id === api.Channel.STABLE) {
      channel = checked
        ? channel | api.ReleaseChannel.Stable
        : channel & ~api.ReleaseChannel.Stable;
    } else if (id === api.Channel.BETA) {
      channel = checked ? channel | api.ReleaseChannel.Beta : channel & ~api.ReleaseChannel.Beta;
    } else {
      channel = checked
        ? channel | api.ReleaseChannel.Nightly
        : channel & ~api.ReleaseChannel.Nightly;
    }

    this.setState(prevState => ({
      newRegistrant: { ...prevState.newRegistrant, channel }
    }));
  };

  private getWebhookData() {
    const webhookData: Record<string, string> = {};

    const provided = document.getElementById('use-provided-client')! as HTMLInputElement;

    if (provided.checked) {
      const { appName } = this.state.newRegistrant;
      const link = `http://sentinel-client.herokuapp.com/${appName}`;
      const platforms = ['linux-x64', 'win32-x64', 'darwin-x64'];
      for (const platform of platforms) {
        webhookData[platform] = link;
      }
    } else {
      const rawTableHTML = document.getElementById('webhook-table')!;
      const rawTableString = rawTableHTML.outerHTML.toString();

      const { results: json } = converter.parse(rawTableString);
      json[0].forEach((hook: { Platform: string; Webhook: string }) => {
        const [platform, link] = [hook.Platform, hook.Webhook];
        if (link !== '') {
          webhookData[platform] = link;
        }
      });
    }

    return webhookData;
  }

  private renderWebHookTable() {
    const hooks = PLATFORMS.map(p => {
      return { platform: p, link: '' };
    });

    const hookData = hooks.map(w => {
      const { platform, link } = w;
      return (
        <tr>
          <td>{platform}</td>
          <td contentEditable={true} suppressContentEditableWarning={true}>
            {link}
          </td>
        </tr>
      );
    });

    return (
      <div className={'table-container'} style={{ borderRadius: '8px' }}>
        <Table bordered id={'webhook-table'}>
          <tbody>
            <tr>
              <th>Platform</th>
              <th>Webhook URL</th>
            </tr>
            {hookData}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default withAlert()(SignUpContainer);
