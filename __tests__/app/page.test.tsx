import { render, screen } from "@testing-library/react";

import Home from "@/app/page";

describe("Home", () => {
  it("renders commercialization messaging", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /Clarion makes AI visibility measurable, sellable, and operational/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Commercialization checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/Visibility intelligence/i)).toBeInTheDocument();
  });
});
