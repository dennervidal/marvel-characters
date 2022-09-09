import styled from 'styled-components'

export const MainDiv = styled.div`
  display: ${({ isDetails }: { isDetails: boolean }) =>
    isDetails ? 'none' : 'flex'};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0 12px 0;
  background-color: #fff;
  height: 96px;
`
