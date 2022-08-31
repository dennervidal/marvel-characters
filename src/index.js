import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import { ThemeProvider } from "@material-ui/styles";

import { PaginationContextProvider } from "context";
import { StyledThemeProvider } from "components/styled";
import App from "./pages/App";
import theme from "./utils/theme";

import "@fontsource/pt-sans";
import "@fontsource/pt-sans-caption";
import "./index.css";

const container = document.getElementById("root")
const root = createRoot(container)

root.render(
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
  </React.StrictMode>
);
