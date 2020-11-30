import React, { useContext } from "react";
import { useMediaQuery } from "@material-ui/core";
import { useCharactersPaginate } from "hooks";
import { LoadingPlaceholder } from "components/LoadingPlaceholder";
import { PaginationContext } from "context";
import { CharactersTable } from "components/CharactersTable";
import { useHistory, useLocation } from "react-router";
import { useTheme } from "@material-ui/styles";
import { MainDiv } from "./styled";
import { SearchHeader } from "components/SearchHeader";

export const Home = React.memo(() => {
  const location = useLocation();
  const history = useHistory();
  const theme = useTheme();
  const params = new URLSearchParams(location.search);
  const mobile = !useMediaQuery(theme.breakpoints.up("sm"));

  const { setTotal, page, gotoPage } = useContext(PaginationContext);
  const { results: characters, loading } = useCharactersPaginate({
    nameStartsWith: params.get("query"),
    setTotal,
    page,
  });

  return (
    <LoadingPlaceholder loading={loading}>
      <MainDiv>
        <SearchHeader
          mobile={mobile}
          history={history}
          query={params.get("query")}
          setPage={gotoPage}
        />
        <CharactersTable
          characters={characters}
          mobile={mobile}
          history={history}
        />
      </MainDiv>
    </LoadingPlaceholder>
  );
});
