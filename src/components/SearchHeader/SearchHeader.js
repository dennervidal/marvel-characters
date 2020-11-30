import React, { useState } from "react";
import { InputAdornment } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import PropTypes from "prop-types";
import { routes } from "routes";
import { IconButton, Input, SearchDiv, Typography } from "./styled";

export const SearchHeader = ({ mobile, query, history }) => {
  const [search, setSearch] = useState(query || "");

  const redirectToSearch = () => routes.SEARCH.redirect(history, search);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      redirectToSearch();
    }
  };
  return (
    <SearchDiv mobile={mobile}>
      <Typography variant="h5" fontSize={32} color="textPrimary">
        Busca de personagens
      </Typography>
      <Typography
        variant="subtitle2"
        color="textPrimary"
        marginMultiplier={mobile ? 3 : 2}
      >
        Nome do personagem
      </Typography>
      <Input
        variant="outlined"
        placeholder="Search"
        size="small"
        onKeyDown={onKeyDown}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={redirectToSearch}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        mobile={mobile}
      />
    </SearchDiv>
  );
};

SearchHeader.propTypes = {
  /** defines if it is mobile or not */
  mobile: PropTypes.bool,
  /** search query param string */
  query: PropTypes.string,
  /** react-router history */
  history: PropTypes.object,
};
