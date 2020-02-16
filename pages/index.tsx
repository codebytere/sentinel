import * as React from 'react'
import Link from 'next/link'

export default () => (
  <ul>
    <li>
      <Link href="/signin" as="/signin">
        <a>Sign In</a>
      </Link>
    </li>
    <li>
      <Link href="/signup" as="/signup">
        <a>Sign Up</a>
      </Link>
    </li>
  </ul>
)
