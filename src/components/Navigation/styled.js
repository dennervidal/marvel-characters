import styled from "styled-components";

export const MainDiv = styled.div`
  display: ${({ isDetails }) => (isDetails ? "none" : "flex")};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0px 12px 0px;
  background-color: #fff;
  height: 96px;
`;
