import React from "react";
import styled, { css } from "styled-components";
import {
  Table as MuiTable,
  TableCell as MuiTCell,
  TableRow as MuiTRow,
  Typography as MuiTypography,
} from "@material-ui/core";

export const ColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

export const RowDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const TableRow = styled(({ mobile, ...props }) => (
  <MuiTRow {...props} />
))`
  && {
    background-color: #fff;
    height: ${({ mobile }) => (mobile ? 72 : 88)}px;
    td:first-child {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    td:last-child {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
    box-shadow: 0px 0px 5px #00000033;
    cursor: pointer;
  }
`;

export const Table = styled(MuiTable)`
  && {
    border-collapse: separate;
    border-spacing: 0 8px;
  }
`;

export const TableCell = styled(({ header, mobile, ...props }) => (
  <MuiTCell {...props} />
))`
  && {
    ${({ header = false, mobile }) =>
      header &&
      css`
        padding: 16px 16px 0 16px;
        border-bottom: unset;
        display: ${mobile && "none"};
      `}
    ${({ header = false, mobile }) =>
      !header &&
      css`
        display: ${mobile && "none"};
      `}
  }
`;

export const Typography = styled(
  ({ fontWeight, marginLeft, fontSize, header, ...props }) => (
    <MuiTypography {...props} />
  )
)`
  && {
    font-weight: ${({ fontWeight = 400 }) => fontWeight};
    margin-left: ${({ marginLeft = 0 }) => marginLeft}px;
    font-family: "PT Sans";
    font-size: ${({ fontSize = 14 }) => fontSize}px;
    color: ${({ header = false }) => header && "#8e8e8e"};
  }
`;
