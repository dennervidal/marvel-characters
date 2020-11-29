import React from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import styled from "styled-components";

const StyledProgress = styled(LinearProgress)`
  && {
    background-color: #555;
  }
`;

const Loading = () => <StyledProgress />;

export { Loading };
