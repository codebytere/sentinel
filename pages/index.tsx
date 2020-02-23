import React, { Component } from 'react'
import { Hero, Columns, Container, Box } from 'react-bulma-components'

class Index extends Component<{}, {}> {
  constructor(props: any) {
    super(props)
  }

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

export default Index
