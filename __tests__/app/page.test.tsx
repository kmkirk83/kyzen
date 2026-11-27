import { render, screen } from "@testing-library/react";

import Home from "./@/app/page".replace("./@/app/page", "@/app/page");

describe("Home", () => {
  it("renders kyzen commercialization messaging", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /Know how AI answers talk about your brand/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/kyzen measures brand presence/i)).toBeInTheDocument();
    expect(screen.getByText(/What you can do today/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View live Evidence/i })).
      .toBeInTheDocument();
  });
});
