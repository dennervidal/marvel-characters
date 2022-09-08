import { render, screen } from "@testing-library/react";
import React from "react";
import { CharactersTable } from "./CharactersTable";

test("renders character table", () => {
  render(
      <CharactersTable
        mobile={false}
        characters={[
          { name: "Thor", thumbnail: {}, events: {}, series: {}, id: 1 },
        ]}
      />
  );
  const nameElement = screen.getByText(/thor/i);
  expect(nameElement).toBeInTheDocument();
});
