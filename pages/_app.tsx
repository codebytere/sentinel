import App, { Container } from 'next/app'
import 'react-bulma-components/dist/react-bulma-components.min.css'
import React from 'react'
import { positions, Provider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'

const options = {
  timeout: 5000,
  position: positions.TOP_CENTER
}

export default class MyApp extends App {
  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {}
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    return { pageProps }
  }

  render() {
    const { Component, pageProps } = this.props
    return (
      <Provider template={AlertTemplate} {...options}>
        <Container>
          <Component {...pageProps} />
        </Container>
      </Provider>
    )
  }
}
