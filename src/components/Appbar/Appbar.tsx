import { AppBar, Toolbar } from '@material-ui/core'
import {
  AppBarRightDiv,
  AvatarStyled,
  LogoImg,
  Title,
  Typography
} from './styled'
import logo from 'assets/marvel.svg'
import React from 'react'
import { routes } from 'routes'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router'

export const Appbar = ({ mobile }: { mobile: boolean }) => {
  const navigate = useNavigate()
  const onClickImage = () => routes.HOME.redirect(navigate)

  return (
    <AppBar variant='outlined' position='fixed'>
      <Toolbar>
        <Title mobile={mobile}>
          <LogoImg src={logo} alt='Logo' onClick={onClickImage} />
        </Title>
        <AppBarRightDiv mobile={mobile}>
          <Typography
            variant='subtitle2'
            fontWeight={700}
            marginRight={mobile ? 16 : 6}
            color='textPrimary'
          >
            Characters
          </Typography>
          <Typography
            variant='body2'
            marginRight={mobile ? 16 : 6}
            color='textPrimary'
          >
            Demo
          </Typography>
        </AppBarRightDiv>
        <AvatarStyled variant='rounded'>
          <Typography variant='caption' fontWeight={700}>
            DV
          </Typography>
        </AvatarStyled>
      </Toolbar>
    </AppBar>
  )
}

Appbar.propTypes = {
  /** boolean that represents if it is mobile view  */
  mobile: PropTypes.bool.isRequired
}
