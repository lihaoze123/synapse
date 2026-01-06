import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock useAuth hook
vi.mock("@/hooks/useAuth", () => ({
	useAuth: () => ({
		login: vi.fn(),
		register: vi.fn(),
		loginWithGitHub: vi.fn(),
		loginWithGoogle: vi.fn(),
		isLoggingIn: false,
		isRegistering: false,
	}),
}));

// Import LoginPage after mocks are set up
import { LoginPage } from "@/components/auth/LoginPage";

describe("LoginPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render login form by default", () => {
		render(<LoginPage />);
		expect(screen.getByText("Welcome back")).toBeInTheDocument();
		expect(
			screen.getByText("Sign in to continue to Synapse"),
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("Enter your username"),
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("Enter your password"),
		).toBeInTheDocument();
	});

	it("should switch to register form when clicking toggle", async () => {
		const user = userEvent.setup();
		render(<LoginPage />);

		await user.click(screen.getByText("Sign up"));
		expect(screen.getByText("Create account")).toBeInTheDocument();
		expect(screen.getByText("Join the community today")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("Choose a username"),
		).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
	});

	it("should display both GitHub and Google OAuth options", () => {
		render(<LoginPage />);
		expect(screen.getByText("Continue with GitHub")).toBeInTheDocument();
		expect(screen.getByText("Continue with Google")).toBeInTheDocument();
	});
});
