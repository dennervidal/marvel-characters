import React from "react";
import {
  TableRow as MuiTRow,
  TableBody,
  TableHead,
  Avatar,
} from "@material-ui/core";
import {
  Table,
  Typography,
  TableCell,
  TableRow,
  ColumnDiv,
  RowDiv,
} from "./styled";
import PropTypes from "prop-types";
import { routes } from "routes";

export const CharactersTable = ({ characters, mobile, history }) => {
  return (
    <Table>
      <TableHead>
        <MuiTRow>
          <TableCell key="character" header>
            <Typography
              variant="subtitle2"
              fontSize={12}
              marginLeft={mobile && 64}
              header
            >
              Personagem
            </Typography>
          </TableCell>
          <TableCell key="series" header mobile={mobile}>
            <Typography variant="subtitle2" fontSize={12} header>
              Séries
            </Typography>
          </TableCell>
          <TableCell key="events" header mobile={mobile}>
            <Typography variant="subtitle2" fontSize={12} header>
              Eventos
            </Typography>
          </TableCell>
        </MuiTRow>
      </TableHead>
      <TableBody>
        {(characters || []).map(
          ({ name, thumbnail, events, series, id }, idx) => (
            <TableRow
              key={`${name}-${idx}`}
              mobile={mobile}
              onClick={() => routes.DETAILS.redirect(history, id)}
            >
              <TableCell>
                <RowDiv>
                  <Avatar
                    variant="rounded"
                    src={`${thumbnail?.path}.${thumbnail?.extension}`}
                  />
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    fontSize={16}
                    marginLeft={24}
                  >
                    {name}
                  </Typography>
                </RowDiv>
              </TableCell>
              <TableCell mobile={mobile}>
                <ColumnDiv>
                  {(series?.items?.slice(0, 3) || []).map(({ name }, idx) => (
                    <Typography key={`${name}-${idx}`} variant="caption">
                      {name}
                    </Typography>
                  ))}
                </ColumnDiv>
              </TableCell>
              <TableCell mobile={mobile}>
                <ColumnDiv>
                  {(events?.items?.slice(0, 3) || []).map(({ name }, idx) => (
                    <Typography key={`${name}-${idx}`} variant="caption">
                      {name}
                    </Typography>
                  ))}
                </ColumnDiv>
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
};

CharactersTable.propTypes = {
  /** characters data */
  characters: PropTypes.array,
  /** boolean that represents if it is mobile view  */
  mobile: PropTypes.bool,
  /** react-router history  */
  history: PropTypes.object,
};
