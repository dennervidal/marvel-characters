import { render, screen } from "@testing-library/react";
import React from "react";
import { SearchHeader } from "./SearchHeader";

test("renders search header", () => {
  render(<SearchHeader mobile={false} history={{}} query="thor" />);
  const label = screen.getByText(/busca de personagens/i);
  const input = screen.getByDisplayValue(/thor/i);
  expect(label).toBeInTheDocument();
  expect(input).toBeInTheDocument();
});
