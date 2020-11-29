import React, { useContext } from "react";
import Pagination from "@material-ui/lab/Pagination";
import styled from "styled-components";
import { PaginationContext } from "context";

const MainDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0px 12px 0px;
  background-color: #fff;
  height: 96px;
`;

export const Navigation = () => {
  const { page, total, gotoPage } = useContext(PaginationContext);

  return (
    <MainDiv>
      <Pagination
        shape="rounded"
        showFirstButton
        showLastButton
        count={total}
        page={page}
        onChange={(_, pageNumber) => gotoPage(pageNumber)}
      />
    </MainDiv>
  );
};
