import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "./RegisterForm";

describe("RegisterForm", () => {
  it("should render username, email, and password fields", () => {
    render(<RegisterForm onSubmit={() => {}} onOAuthLogin={{ github: () => {}, google: () => {} }} />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("should validate password confirmation", async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={() => {}} onOAuthLogin={{ github: () => {}, google: () => {} }} />);

    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "different");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("should submit form with valid data", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={handleSubmit} onOAuthLogin={{ github: () => {}, google: () => {} }} />);

    await user.type(screen.getByLabelText(/username/i), "newuser");
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      username: "newuser",
      email: "test@example.com",
      password: "password123",
    });
  });

  it("should validate email format", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={handleSubmit} onOAuthLogin={{ github: () => {}, google: () => {} }} />);

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole("button", { name: /create account/i });

    await user.type(usernameInput, "testuser");
    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "password123");
    await user.type(confirmInput, "password123");

    await user.click(submitButton);

    // Form submission should be prevented due to validation error
    expect(handleSubmit).not.toHaveBeenCalled();

    // Error message should be displayed
    const errorMessage = await screen.findByText(/invalid email/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
