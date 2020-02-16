import Link from 'next/link'

const Nav = () => (
  <nav>
    <Link href="/signin">
      <a>Sign In</a>
    </Link>
    <Link href="/signup">
      <a>Sign Up</a>
    </Link>
    <style jsx>{`
      nav {
        display: flex;
      }
      a:not(:last-child) {
        margin-right: 1em;
      }
    `}</style>
  </nav>
)

export default Nav
