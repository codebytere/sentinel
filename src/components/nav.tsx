import { Navbar } from 'react-bulma-components'
import React from 'react'
import Router from 'next/router'
import { withAlert, AlertManager } from 'react-alert'

class NavBar extends React.Component<
  { alert: AlertManager },
  { open: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { open: false }

    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogout() {
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

  render() {
    const open = this.state.open ? 'is-active' : ''
    const toggleMenu = () => {
      this.setState({ open: !this.state.open })
    }

    return (
      <Navbar fixed={'top'}>
        <Navbar.Brand>
          <a className="navbar-item" href="/">
            <img
              src="https://user-images.githubusercontent.com/2036040/74618739-dcc84000-50e7-11ea-9b90-bd9d16ff623e.png"
              alt="sentinel icon"
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
