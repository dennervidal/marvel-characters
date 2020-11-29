import React, { useContext } from "react";
import { useCharactersPaginate } from "../../hooks/useCharactersPaginate";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import { LoadingPlaceholder } from "../../components/LoadingPlaceholder/LoadingPlaceholder";
import styled from "styled-components";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import { PaginationContext } from "../../context/PaginationContext";

const MainDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0px 24px 0px 24px;
`;

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

export const Home = () => {
  const { setTotal, page } = useContext(PaginationContext);
  const { results: characters, loading } = useCharactersPaginate({
    setTotal,
    page,
  });

  console.log(characters);

  return (
    <LoadingPlaceholder loading={loading}>
      <MainDiv>
        <StyledTable>
          <TableHead>
            <TableRow>
              <StyledHeaderCell key="character">Personagem</StyledHeaderCell>
              <StyledHeaderCell key="series">Séries</StyledHeaderCell>
              <StyledHeaderCell key="events">Eventos</StyledHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(characters || []).map(({ name, thumbnail, events, series }) => (
              <StyledTableRow key={name}>
                <TableCell>
                  <RowDiv>
                    <Avatar
                      variant="rounded"
                      src={`${thumbnail.path}.${thumbnail.extension}`}
                    />
                    <Typography variant="subtitle2">{name}</Typography>
                  </RowDiv>
                </TableCell>
                <TableCell>
                  <ColumnDiv>
                    {(series.items.slice(0, 3) || []).map(({ name }) => (
                      <Typography key={name} variant="caption">
                        {name}
                      </Typography>
                    ))}
                  </ColumnDiv>
                </TableCell>
                <TableCell>
                  <ColumnDiv>
                    {(events.items.slice(0, 3) || []).map(({ name }) => (
                      <Typography key={name} variant="caption">
                        {name}
                      </Typography>
                    ))}
                  </ColumnDiv>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </StyledTable>
      </MainDiv>
    </LoadingPlaceholder>
  );
};
