import React from "react";
import {
  Table as MuiTable,
  TableRow as MuiTRow,
  TableCell,
  TableBody,
  TableHead,
  Avatar,
  Typography,
} from "@material-ui/core";
import styled from "styled-components";

const ColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

const RowDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TableRow = styled(MuiTRow)`
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
  }
`;

const Table = styled(MuiTable)`
  && {
    border-collapse: separate;
    border-spacing: 0 8px;
  }
`;

const HeaderCell = styled(TableCell)`
  && {
    padding: 16px 16px 0 16px;
    border-bottom: unset;
  }
`;

export const CharactersTable = ({ characters, mobile }) => {
  return (
    <Table>
      <TableHead>
        <MuiTRow>
          <HeaderCell key="character">Personagem</HeaderCell>
          <HeaderCell key="series">Séries</HeaderCell>
          <HeaderCell key="events">Eventos</HeaderCell>
        </MuiTRow>
      </TableHead>
      <TableBody>
        {(characters || []).map(({ name, thumbnail, events, series }, idx) => (
          <TableRow key={`${name}-${idx}`} mobile={mobile}>
            <TableCell>
              <RowDiv>
                <Avatar
                  variant="rounded"
                  src={`${thumbnail?.path}.${thumbnail?.extension}`}
                />
                <Typography variant="subtitle2">{name}</Typography>
              </RowDiv>
            </TableCell>
            <TableCell>
              <ColumnDiv>
                {(series?.items?.slice(0, 3) || []).map(({ name }, idx) => (
                  <Typography key={`${name}-${idx}`} variant="caption">
                    {name}
                  </Typography>
                ))}
              </ColumnDiv>
            </TableCell>
            <TableCell>
              <ColumnDiv>
                {(events?.items?.slice(0, 3) || []).map(({ name }, idx) => (
                  <Typography key={`${name}-${idx}`} variant="caption">
                    {name}
                  </Typography>
                ))}
              </ColumnDiv>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
