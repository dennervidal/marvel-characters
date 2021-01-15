import React from "react";
import styled from "styled-components";
import { Avatar, Typography as MuiTypography } from "@material-ui/core";

export const LogoImg = styled.img`
  max-height: 34px;
  width: auto;
  cursor: pointer;
`;

export const Title = styled.div`
  flex-grow: 1;
  padding-right: ${({ mobile }) => mobile && 32}px;
`;

export const AvatarStyled = styled(Avatar)`
  && {
    background-color: #f5f5f5;
    width: 32px;
    height: 32px;
    color: #555;
  }
`;

export const AppBarRightDiv = styled.div`
  display: flex;
  flex-direction: ${({ mobile }) => (mobile ? "column" : "row")};
  align-items: ${({ mobile }) => (mobile ? "flex-end" : "center")};
`;

export const Typography = styled(({ fontWeight, marginRight, ...props }) => (
  <MuiTypography {...props} />
))`
  && {
    font-weight: ${({ fontWeight = 400 }) => fontWeight};
    margin-right: ${({ marginRight = 0 }) => marginRight}px;
    font-family: "PT Sans Caption";
    font-size: 14px;
  }
`;
