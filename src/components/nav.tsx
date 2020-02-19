import { Navbar } from 'react-bulma-components'
import { Component, Fragment } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { withAlert } from 'react-alert'
import { SENTINEL_LOGO } from '../server/constants'
import { IAlertProps, INavBarState } from 'src/server/interfaces'
// import dynamic from 'next/dynamic'

import { AuthContext, IAuthProviderState } from '../contexts/auth'

class NavBar extends Component<IAlertProps, INavBarState> {
  static contextType = AuthContext

  constructor(props: IAlertProps) {
    super(props)
    this.state = { open: false }

    this.handleLogout = this.handleLogout.bind(this)
  }

  componentDidMount() {
    // TODO(codebytere): this does not seem optimal.
    this.context.checkSignIn()
  }

  private handleLogout(auth: IAuthProviderState) {
    const alert = this.props.alert

    fetch('/logout', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.status === 200) {
          alert.show('Successfully logged out')
          auth.onSignOut()
          Router.push('/')
        } else {
          alert.show('Logout failed')
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  public render() {
    const open = this.state.open ? 'is-active' : ''
    const toggleMenu = () => {
      this.setState({ open: !this.state.open })
    }

    return (
      <Navbar fixed={'top'}>
        <Navbar.Brand>
          <a className="navbar-item" href="/">
            <img src={SENTINEL_LOGO} alt="sentinel robot icon" width={28} />
          </a>
          <Navbar.Burger className={open} onClick={toggleMenu} />
        </Navbar.Brand>
        <Navbar.Menu className={open}>
          <AuthContext.Consumer>
            {(auth: IAuthProviderState) =>
              !auth.user ? (
                <Fragment>
                  <Link href="/signup">
                    <a className="navbar-item">Sign Up</a>
                  </Link>
                  <Link href="/signin">
                    <a className="navbar-item">Sign In</a>
                  </Link>
                </Fragment>
              ) : (
                <Fragment>
                  <Link href="/home">
                    <a className="navbar-item">Home</a>
                  </Link>
                  <p className="navbar-item">Logged in as:&nbsp;<b>{auth.user.name}</b></p>
                  <Navbar.Container position="end">
                    <a
                      className="navbar-item"
                      onClick={() => {
                        this.handleLogout(auth)
                      }}
                    >
                      Log Out
                    </a>
                  </Navbar.Container>
                </Fragment>
              )
            }
          </AuthContext.Consumer>
        </Navbar.Menu>
      </Navbar>
    )
  }
}

export default withAlert()(NavBar)
