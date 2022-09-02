import React from 'react'
import Typography from '@material-ui/core/Typography'
import { Container, Link, SubContainer, TextContainer } from './styled'

const NotFound = () => (
  <Container>
    <SubContainer>
      <Typography variant='h1' color='secondary'>
        404
      </Typography>
    </SubContainer>
    <br />
    <TextContainer>
      <Typography variant='h3'>Ainda nada aqui, :(</Typography>
      <Typography variant='h3'>talvez em breve, mas não agora</Typography>
    </TextContainer>
    <TextContainer>
      <Link href='..'>Volte aqui</Link>
    </TextContainer>
  </Container>
)

export { NotFound }
