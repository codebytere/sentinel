import React, { Component } from 'react'
import { Hero, Columns, Box } from 'react-bulma-components'
import { Container } from 'next/app'

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
              <Columns.Column>
                <Box>
                  <img
                    src="https://user-images.githubusercontent.com/2036040/74618739-dcc84000-50e7-11ea-9b90-bd9d16ff623e.png"
                    alt="Sentinel Robot Logo"
                  />
                </Box>
              </Columns.Column>
            </Columns>
          </Container>
        </Hero.Body>
      </Hero>
    )
  }
}

export default Home
