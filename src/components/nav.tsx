import { Navbar } from 'react-bulma-components'

const NavBar = () => (
  <Navbar>
    <Navbar.Brand>
      <a className="navbar-item" href="/">
        <img
          src="https://user-images.githubusercontent.com/2036040/74618739-dcc84000-50e7-11ea-9b90-bd9d16ff623e.png"
          alt="sentinel icon"
          width={28}
          height={28}
        />
      </a>
      <Navbar.Burger />
    </Navbar.Brand>
    <Navbar.Menu>
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
        <a className="navbar-item" href="/logout">
          Log Out
        </a>
      </Navbar.Container>
    </Navbar.Menu>
  </Navbar>
)

export default NavBar
