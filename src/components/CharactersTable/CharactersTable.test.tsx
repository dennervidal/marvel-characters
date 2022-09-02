import { render, screen } from "@testing-library/react";
import React from "react";
import { CharactersTable } from "./CharactersTable";
import { Router } from "react-router";

// TODO: Remove ignore
test("renders character table", () => {
  render(
    /* @ts-ignore */
    <Router location={{}} navigator={() => {}}>
      <CharactersTable
        mobile={false}
        characters={[
          { name: "Thor", thumbnail: {}, events: {}, series: {}, id: 1 },
        ]}
      />
    </Router>
  );
  const nameElement = screen.getByText(/thor/i);
  expect(nameElement).toBeInTheDocument();
});
