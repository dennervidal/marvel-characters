import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'

export const LogoImg = styled(Image)`
  max-height: 34px;
  width: auto;
  cursor: pointer;
`

export const Title = styled.div`
  flex-grow: 1;
  padding-right: ${({ mobile }: { mobile: boolean }) => mobile && 32}px;
`
