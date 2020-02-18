import React, { Component } from 'react'
import { Hero, Columns, Box, Container } from 'react-bulma-components'

class Home extends Component<{}, {}> {
  constructor(props: any) {
    super(props)
  }

  render() {
    return (
      <Hero color={'primary'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns className={'is-centered'}>
              <Columns.Column size={4}>
                <Box>EMBEDDED GRAFANA</Box>
              </Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    )
  }
}

export default Home
