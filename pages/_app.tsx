import App from 'next/app'
import dynamic from 'next/dynamic'
import 'react-bulma-components/dist/react-bulma-components.min.css'
import React from 'react'
import { positions, Provider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
import AuthProvider from '../src/contexts/auth'

const Nav = dynamic(() => import('../src/components/nav'), { ssr: false })

const options = {
  timeout: 5000,
  position: positions.TOP_CENTER
}

export default class Sentinel extends App {
  render() {
    const { Component, pageProps } = this.props
    return (
      <Provider template={AlertTemplate} {...options}>
        <AuthProvider>
          <Nav />
          <Component {...pageProps} />
        </AuthProvider>
      </Provider>
    )
  }
}
