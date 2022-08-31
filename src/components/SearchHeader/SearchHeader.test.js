import { render, screen } from "@testing-library/react";
import React from "react";
import { SearchHeader } from "./SearchHeader";
import { Router } from "react-router";

test("renders search header", () => {
  render(
    <Router location={{}} navigator={() => {}}>
      <SearchHeader mobile={false} query="thor" />
    </Router>
  );
  const label = screen.getByText(/find a character/i);
  const input = screen.getByDisplayValue(/thor/i);
  expect(label).toBeInTheDocument();
  expect(input).toBeInTheDocument();
});
