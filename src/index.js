import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import "fontsource-pt-sans-caption";
import "fontsource-pt-sans";
import App from "./pages/App/App";
import { ThemeProvider } from "@material-ui/styles";
import theme from "./utils/theme";
import { StyledThemeProvider } from "./components/styled/StyledThemeProvider";
import { PaginationContextProvider } from "./context/PaginationContextProvider";

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
