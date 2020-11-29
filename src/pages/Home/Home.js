import React, { useContext, useState } from "react";
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import { IconButton, useMediaQuery } from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import { useCharactersPaginate } from "hooks";
import { LoadingPlaceholder } from "components/LoadingPlaceholder";
import { PaginationContext } from "context";
import { CharactersTable } from "components/CharactersTable";
import { useHistory, useLocation } from "react-router";
import { routes } from "routes";
import { useTheme } from "@material-ui/styles";

const MainDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0px 24px 0px 24px;
`;

const StyledInput = styled(TextField)`
  && {
    width: 300px;
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

const StyledIconButton = styled(IconButton)`
  && {
    padding: 4px;
  }
`;

const SearchDiv = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 40px;
  margin-bottom: 24px;
`;

const StyledTypography = styled(Typography)`
  && {
    font-weight: ${({ fontWeight = 600 }) => fontWeight};
    font-size: ${({ fontSize = 16 }) => fontSize}px;
    font-family: "PT Sans Caption";
  }
`;

export const Home = React.memo(() => {
  const location = useLocation();
  const history = useHistory();
  const theme = useTheme();
  const params = new URLSearchParams(location.search);
  const [search, setSearch] = useState(params.get("query") || "");
  const mobile = !useMediaQuery(theme.breakpoints.up("sm"));

  const { setTotal, page } = useContext(PaginationContext);
  const { results: characters, loading } = useCharactersPaginate({
    nameStartsWith: params.get("query"),
    setTotal,
    page,
  });

  const redirectToSearch = () => routes.SEARCH.redirect(history, search);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      redirectToSearch();
    }
  };

  return (
    <LoadingPlaceholder loading={loading}>
      <MainDiv>
        <SearchDiv>
          <StyledTypography variant="h5" fontSize={32} color="textPrimary">
            Busca de personagens
          </StyledTypography>
          <StyledTypography variant="subtitle2" color="textPrimary">
            Nome do personagem
          </StyledTypography>
          <StyledInput
            variant="outlined"
            placeholder="Search"
            size="small"
            onKeyDown={onKeyDown}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <StyledIconButton onClick={redirectToSearch}>
                    <SearchIcon />
                  </StyledIconButton>
                </InputAdornment>
              ),
            }}
          />
        </SearchDiv>
        <CharactersTable characters={characters} mobile={mobile} />
      </MainDiv>
    </LoadingPlaceholder>
  );
});
