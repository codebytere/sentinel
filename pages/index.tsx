import * as React from 'react';
import Link from 'next/link'

export default () => (
  <ul>
    <li>
      <Link href="/sign_in" as="/sign_in">
        <a>Sign In</a>
      </Link>
    </li>
    <li>
      <Link href="/sign_up" as="/sign_up">
        <a>Sign Up</a>
      </Link>
    </li>
  </ul>
)