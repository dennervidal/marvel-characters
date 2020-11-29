import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import React from "react";
import styled from "styled-components";
import Table from "@material-ui/core/Table";

const ColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

const RowDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StyledTableRow = styled(TableRow)`
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

const StyledTable = styled(Table)`
  && {
    border-collapse: separate;
    border-spacing: 0 8px;
  }
`;

const StyledHeaderCell = styled(TableCell)`
  && {
    padding: 16px 16px 0 16px;
    border-bottom: unset;
  }
`;

export const CharactersTable = ({ characters, mobile }) => {
  return (
    <StyledTable>
      <TableHead>
        <TableRow>
          <StyledHeaderCell key="character">Personagem</StyledHeaderCell>
          <StyledHeaderCell key="series">Séries</StyledHeaderCell>
          <StyledHeaderCell key="events">Eventos</StyledHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(characters || []).map(({ name, thumbnail, events, series }, idx) => (
          <StyledTableRow key={`${name}-${idx}`} mobile={mobile}>
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
          </StyledTableRow>
        ))}
      </TableBody>
    </StyledTable>
  );
};
