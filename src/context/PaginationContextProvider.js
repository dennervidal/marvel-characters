import React, { useState } from "react";
import PropTypes from "prop-types";
import { PaginationContext } from "./PaginationContext";

const PaginationContextProvider = ({ children }) => {
  const [page, _setPage] = useState(1);
  const [total, _setTotal] = useState(0);

  const gotoPage = (pageNumber) => {
    _setPage(pageNumber);
  };

  const setTotal = (totalNumber) => {
    _setTotal(totalNumber);
  };

  return (
    <PaginationContext.Provider
      value={{
        page,
        gotoPage,
        total,
        setTotal,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
};

PaginationContextProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export { PaginationContextProvider };
