import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@material-ui/styles";

import { PaginationContextProvider } from "context";
import { StyledThemeProvider } from "components/styled";
import App from "./pages/App";
import theme from "./utils/theme";

import "@fontsource/pt-sans";
import "@fontsource/pt-sans-caption";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <PaginationContextProvider>
        <Router>
          <StyledThemeProvider>
            <App />
          </StyledThemeProvider>
        </Router>
      </PaginationContextProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
