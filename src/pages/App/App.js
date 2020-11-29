import React, { Suspense } from "react";
import { useHistory } from "react-router-dom";
import { useTheme } from "@material-ui/styles";
import {
  useMediaQuery,
  Typography as MuiTypography,
  AppBar,
  Toolbar,
  Avatar,
} from "@material-ui/core";
import styled from "styled-components";
import { routes } from "routes";
import { RoutesList } from "routes/RoutesList";
import { useWindowSize } from "hooks";
import { Loading } from "components/Loading";
import { Navigation } from "components/Navigation";
import logo from "assets/objective-logo.png";

const MainDiv = styled.div`
  display: flex;
  flex-direction: column;
  height: ${(props) => props.height}px;
  background-color: ${({ theme }) => theme.palette.background.default};
`;

const AppContainer = styled.div`
  flex-direction: column;
  overflow-y: scroll;
  overflow-x: none;
  display: flex;
  flex-grow: 1;
  margin-top: 66px;
`;

const LogoImg = styled.img`
  max-height: 28px;
  width: auto;
  cursor: pointer;
`;

const Title = styled.div`
  flex-grow: 1;
  padding-right: ${({ mobile }) => mobile && 32}px;
`;

const AvatarStyled = styled(Avatar)`
  && {
    background-color: #f5f5f5;
    width: 32px;
    height: 32px;
    color: #555;
  }
`;

const AppBarRightDiv = styled.div`
  display: flex;
  flex-direction: ${({ mobile }) => (mobile ? "column" : "row")};
  align-items: center;
`;

const Typography = styled(MuiTypography)`
  && {
    font-weight: ${({ fontWeight = 400 }) => fontWeight};
    margin-right: ${({ marginRight = 0 }) => marginRight}px;
    font-family: "PT Sans Caption";
    font-size: 14px;
  }
`;

const App = () => {
  const history = useHistory();
  const theme = useTheme();
  const mobile = !useMediaQuery(theme.breakpoints.up("sm"));
  const [, height] = useWindowSize();

  const onClickImage = () => routes.HOME.redirect(history);

  return (
    <MainDiv height={height}>
      <div>
        <AppBar variant="outlined" position="fixed">
          <Toolbar>
            <Title mobile={mobile}>
              <LogoImg src={logo} alt="Logo" onClick={onClickImage} />
            </Title>
            <AppBarRightDiv mobile={mobile}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                marginRight={6}
                color="textPrimary"
              >
                Denner Vidal
              </Typography>
              <Typography variant="body2" marginRight={6} color="textPrimary">
                Teste de Front-end
              </Typography>
              <AvatarStyled variant="rounded">
                <Typography variant="caption" fontWeight={700}>
                  CB
                </Typography>
              </AvatarStyled>
            </AppBarRightDiv>
          </Toolbar>
        </AppBar>
      </div>
      <AppContainer>
        <Suspense fallback={<Loading id="loading" />}>
          <RoutesList />
        </Suspense>
      </AppContainer>
      <Navigation />
    </MainDiv>
  );
};

export default App;
