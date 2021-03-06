import React, { Suspense } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTheme } from "@material-ui/styles";
import { useMediaQuery } from "@material-ui/core";
import { RoutesList } from "routes/RoutesList";
import { useWindowSize } from "hooks";
import { Loading } from "components/Loading";
import { Navigation } from "components/Navigation";
import { MainDiv, AppContainer } from "./styled";
import { Appbar } from "components/Appbar/Appbar";

const App = () => {
  const history = useHistory();
  const location = useLocation();
  const theme = useTheme();
  const mobile = !useMediaQuery(theme.breakpoints.up("sm"));
  const [, height] = useWindowSize();

  return (
    <MainDiv height={height}>
      <div>
        <Appbar mobile={mobile} history={history} />
      </div>
      <AppContainer mobile={mobile}>
        <Suspense fallback={<Loading id="loading" />}>
          <RoutesList />
        </Suspense>
      </AppContainer>
      <Navigation location={location} />
    </MainDiv>
  );
};

export default App;
