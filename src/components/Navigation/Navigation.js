import React, { useContext } from "react";
import Pagination from "@material-ui/lab/Pagination";
import PropTypes from "prop-types";
import { PaginationContext } from "context";
import { MainDiv } from "./styled";

export const Navigation = ({ location }) => {
  const isDetails = location.pathname.startsWith("/details");
  const { page, total, gotoPage } = useContext(PaginationContext);

  return (
    <MainDiv isDetails={isDetails}>
      <Pagination
        shape="rounded"
        showFirstButton={page > 1}
        showLastButton={page < total}
        count={total}
        page={page}
        onChange={(_, pageNumber) => gotoPage(pageNumber)}
        siblingCount={0}
        hideNextButton={page === total}
        hidePrevButton={page === 1}
      />
    </MainDiv>
  );
};

Navigation.propTypes = {
  /** react-router location */
  location: PropTypes.object,
};
