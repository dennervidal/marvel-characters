import { render, screen } from "@testing-library/react";
import React from "react";
import { SearchHeader } from "./SearchHeader";
import { Router } from "react-router";

// TODO: Remove ignore
test("renders search header", () => {
  render(
    /* @ts-ignore */
    <Router location={{}} navigator={{}}>
      <SearchHeader mobile={false} query="thor" setPage={() => {}} />
    </Router>
  );
  const label = screen.getByText(/find a character/i);
  const input = screen.getByDisplayValue(/thor/i);
  expect(label).toBeInTheDocument();
  expect(input).toBeInTheDocument();
});
