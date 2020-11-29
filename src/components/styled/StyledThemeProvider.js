import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@material-ui/styles";
import { ThemeProvider } from "styled-components";

const StyledThemeProvider = ({ children }) => {
  const muiTheme = useTheme();

  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
};

StyledThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { StyledThemeProvider };
