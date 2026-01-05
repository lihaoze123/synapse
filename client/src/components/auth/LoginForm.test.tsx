import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
	it("should render username and password fields", () => {
		const mockOnSubmit = vi.fn();
		const mockOAuthLogin = {
			github: vi.fn(),
			google: vi.fn(),
		};
		render(<LoginForm onSubmit={mockOnSubmit} onOAuthLogin={mockOAuthLogin} />);
		expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
	});

	it("should submit form with credentials", async () => {
		const handleSubmit = vi.fn();
		const mockOAuthLogin = {
			github: vi.fn(),
			google: vi.fn(),
		};
		const user = userEvent.setup();
		render(<LoginForm onSubmit={handleSubmit} onOAuthLogin={mockOAuthLogin} />);

		await user.type(screen.getByLabelText(/username/i), "testuser");
		await user.type(screen.getByLabelText(/password/i), "password123");
		await user.click(screen.getByRole("button", { name: /sign in/i }));

		expect(handleSubmit).toHaveBeenCalledWith({
			username: "testuser",
			password: "password123",
		});
	});

	it("should show validation errors for empty fields", async () => {
		const mockOnSubmit = vi.fn();
		const mockOAuthLogin = {
			github: vi.fn(),
			google: vi.fn(),
		};
		const user = userEvent.setup();
		render(<LoginForm onSubmit={mockOnSubmit} onOAuthLogin={mockOAuthLogin} />);

		const submitButton = screen.getByRole("button", { name: /sign in/i });
		await user.click(submitButton);

		expect(screen.getByText(/username is required/i)).toBeInTheDocument();
	});

	it("should call OAuth login handlers", async () => {
		const handleGitHubLogin = vi.fn();
		const handleGoogleLogin = vi.fn();
		const mockOnSubmit = vi.fn();
		const user = userEvent.setup();

		render(
			<LoginForm
				onSubmit={mockOnSubmit}
				onOAuthLogin={{ github: handleGitHubLogin, google: handleGoogleLogin }}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /github/i }));
		expect(handleGitHubLogin).toHaveBeenCalled();

		await user.click(screen.getByRole("button", { name: /google/i }));
		expect(handleGoogleLogin).toHaveBeenCalled();
	});
});
