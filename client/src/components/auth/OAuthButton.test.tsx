import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OAuthButton } from "./OAuthButton";

describe("OAuthButton", () => {
  it("should render GitHub button with icon", () => {
    render(<OAuthButton provider="github" onClick={() => {}} />);
    expect(screen.getByText(/continue with github/i)).toBeInTheDocument();
  });

  it("should render Google button with icon", () => {
    render(<OAuthButton provider="google" onClick={() => {}} />);
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
  });

  it("should call onClick handler when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<OAuthButton provider="github" onClick={handleClick} />);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should show loading state", () => {
    render(<OAuthButton provider="google" onClick={() => {}} isLoading />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
