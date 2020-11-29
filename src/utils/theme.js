import { createMuiTheme } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#fff",
    },
    secondary: {
      main: "#e5e5e5",
    },
    background: {
      default: "#e5e5e5",
    },
    text: {
      primary: "#555",
    },
  },
  typography: {
    fontFamily: ["PT Sans", "PT Sans Caption"].join(","),
  },
});

export default theme;
