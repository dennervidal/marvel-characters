import React from "react";
import styled from "styled-components";
import {
  IconButton as MuiIconButton,
  TextField,
  Typography as MuiTypography,
} from "@material-ui/core";

export const Input = styled(({ mobile, ...props }) => <TextField {...props} />)`
  && {
    width: ${({ mobile }) => (mobile ? "100%" : "300px")};
    height: 40px;
    border-radius: 4px;
    background-color: #fff;
    border: none;
    fieldset {
      border: unset;
    }
    margin-top: 8px;
  }
`;

export const IconButton = styled(MuiIconButton)`
  && {
    padding: 4px;
  }
`;

export const SearchDiv = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 40px;
  margin-bottom: 24px;
  align-items: ${({ mobile }: { mobile: boolean }) => mobile && "center"};
`;

export const Typography = styled(
  ({ fontWeight, fontSize, marginMultiplier, ...props }) => (
    <MuiTypography {...props} />
  )
)`
  && {
    font-weight: ${({ fontWeight = 600 }: { fontWeight: number }) =>
      fontWeight};
    font-size: ${({ fontSize = 16 }: { fontSize: number }) => fontSize}px;
    font-family: "PT Sans Caption";
    margin-top: ${({ marginMultiplier = 0 }) => marginMultiplier * 8}px;
  }
`;
