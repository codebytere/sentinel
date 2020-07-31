import { Component, createContext } from 'react';

type SentinelUser = { name: string; id: number };
export interface IAuthProviderState {
  user?: SentinelUser;
  signIn: (user: SentinelUser) => void;
  signOut: () => void;
  fetchAuthedUser: () => void;
}

export const AuthContext = createContext({
  signIn: (user: SentinelUser) => {},
  signOut: () => {},
  fetchAuthedUser: () => {}
});

export default class AuthProvider extends Component<{}, IAuthProviderState> {
  constructor(props: any) {
    super(props);

    this.state = {
      signIn: this.signIn,
      signOut: this.signOut,
      fetchAuthedUser: this.fetchAuthedUser
    };
  }

  componentDidMount() {
    this.fetchAuthedUser()
      .then(result => {
        if (result.authed) {
          this.setState({ user: result.user });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  public render() {
    return <AuthContext.Provider value={this.state}>{this.props.children}</AuthContext.Provider>;
  }

  private fetchAuthedUser = () => {
    return fetch('/checkAuth').then(response => response.json());
  };

  private signIn = (user: SentinelUser) => {
    this.setState({ user });
  };

  private signOut = () => {
    this.setState({ user: undefined });
  };
}
