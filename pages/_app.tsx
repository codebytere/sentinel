import App from 'next/app'
import 'react-bulma-components/dist/react-bulma-components.min.css'
import React from 'react'
import { positions, Provider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
import Nav from '../src/components/nav'

const options = {
  timeout: 5000,
  position: positions.TOP_CENTER
}

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props
    return (
      <Provider template={AlertTemplate} {...options}>
        <Nav />
        <Component {...pageProps} />
      </Provider>
    )
  }
}
