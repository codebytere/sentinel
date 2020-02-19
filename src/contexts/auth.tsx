import { Component, createContext } from 'react'

type SentinelUser = { name: string; id: number }
export interface IAuthProviderState {
  user?: SentinelUser
  signIn: (user: SentinelUser) => void
  checkSignIn: () => void
  onSignOut: () => void
}

export const AuthContext = createContext({
  signIn: (user: SentinelUser) => {},
  checkSignIn: () => {},
  onSignOut: () => {}
})

export default class AuthProvider extends Component<{}, IAuthProviderState> {
  constructor(props: any) {
    super(props)

    this.state = {
      signIn: this.signIn,
      checkSignIn: this.checkSignIn,
      onSignOut: this.onSignOut
    }
  }

  public render() {
    return (
      <AuthContext.Provider value={this.state}>
        {this.props.children}
      </AuthContext.Provider>
    )
  }

  private signIn = (user: SentinelUser) => {
    this.setState({ user })
  }

  private checkSignIn = () => {
    fetch('/checkAuth')
      .then(response => response.json())
      .then(user => {
        this.setState({ user })
      })
      .catch(err => {
        console.log(err)
      })
  }

  private onSignOut = () => {
    this.setState({ user: undefined })
  }
}
