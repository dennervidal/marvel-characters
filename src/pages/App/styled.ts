import styled from 'styled-components'

export const MainDiv = styled.div`
  display: flex;
  flex-direction: column;
  height: ${({ height }: { height: string | number }) => height}px;
  background-color: ${({ theme }) => theme.palette.background.default};
`

export const AppContainer = styled.div`
  flex-direction: column;
  overflow-y: scroll;
  overflow-x: unset;
  display: flex;
  flex-grow: 1;
  margin-top: ${({ mobile }: { mobile: boolean }) => (mobile ? 58 : 66)}px;
`
