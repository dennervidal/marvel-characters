import React from "react";
import { TableRow as MuiTRow, TableBody, TableHead } from "@material-ui/core";
import {
  Table,
  Typography,
  TableCell,
  TableRow,
  ColumnDiv,
  RowDiv,
  Avatar,
} from "./styled";
import PropTypes from "prop-types";
import { routes } from "routes";
import {useNavigate} from "react-router";

export const CharactersTable = ({ characters, mobile }) => {
  const navigate = useNavigate()
  return (
    <Table>
      <TableHead>
        <MuiTRow>
          <TableCell key="character" header>
            <Typography
              variant="subtitle2"
              fontSize={12}
              marginLeft={mobile && 68}
              header
            >
              Character
            </Typography>
          </TableCell>
          <TableCell key="series" header mobile={mobile}>
            <Typography variant="subtitle2" fontSize={12} header>
              Series
            </Typography>
          </TableCell>
          <TableCell key="events" header mobile={mobile}>
            <Typography variant="subtitle2" fontSize={12} header>
              Events
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
              onClick={() => routes.DETAILS.redirect(navigate, id)}
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
};
