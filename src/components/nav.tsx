import { Navbar } from 'react-bulma-components'
import React from 'react'
import Router from 'next/router'
import { withAlert } from 'react-alert'
import { SENTINEL_LOGO } from '../server/constants'
import { IAlertProps, INavBarState } from 'src/server/interfaces'

class NavBar extends React.Component<IAlertProps, INavBarState> {
  constructor(props: IAlertProps) {
    super(props)
    this.state = { open: false }

    this.handleLogout = this.handleLogout.bind(this)
  }

  private handleLogout() {
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
          Router.push('/')
        } else {
          alert.show('Logout failed')
        }
      })
      .catch(err => {
        console.log('ERROR: ', err)
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
            <img
              src={SENTINEL_LOGO}
              alt="sentinel robot icon"
              width={28}
              height={28}
            />
          </a>
          <Navbar.Burger className={open} onClick={toggleMenu} />
        </Navbar.Brand>
        <Navbar.Menu className={open}>
          <Navbar.Container>
            <a className="navbar-item" href="/home">
              Home
            </a>
            <a className="navbar-item" href="/signup">
              Sign Up
            </a>
            <a className="navbar-item" href="/signin">
              Sign In
            </a>
          </Navbar.Container>
          <Navbar.Container position="end">
            <a className="navbar-item" onClick={this.handleLogout}>
              Log Out
            </a>
          </Navbar.Container>
        </Navbar.Menu>
      </Navbar>
    )
  }
}

export default withAlert()(NavBar)
