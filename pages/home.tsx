import React, { Component } from 'react'
import { Hero, Columns, Container, Box } from 'react-bulma-components'
import { HomeState } from '../src/server/interfaces'

class Home extends Component<{}, HomeState> {
  public render() {
    return (
      <Hero color={'info'} size={'fullheight'}>
        <Hero.Body>
          <Container>
            <Columns className={'is-centered'}>
              <Columns.Column size={4}>
                <Box>TODO</Box>
              </Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    )
  }
}

export default Home
