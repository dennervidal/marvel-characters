import { render, screen } from "@testing-library/react";
import React from "react";
import { SearchHeader } from "./SearchHeader";

// TODO: Remove ignore
test("renders search header", () => {
  render(
      <SearchHeader mobile={false} query="thor" setPage={() => {}} />
  );
  const label = screen.getByText(/find a character/i);
  const input = screen.getByDisplayValue(/thor/i);
  expect(label).toBeInTheDocument();
  expect(input).toBeInTheDocument();
});
