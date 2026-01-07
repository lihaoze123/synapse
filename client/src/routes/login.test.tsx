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
		expect(screen.getByText("欢迎回来")).toBeInTheDocument();
		expect(screen.getByText("登录 Synapse 继续探索")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("请输入用户名")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("请输入密码")).toBeInTheDocument();
	});

	it("should switch to register form when clicking toggle", async () => {
		const user = userEvent.setup();
		render(<LoginPage />);

		await user.click(screen.getByText("立即注册"));
		expect(screen.getByText("创建账户")).toBeInTheDocument();
		expect(screen.getByText("加入我们的社区")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("请输入用户名")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("请输入邮箱")).toBeInTheDocument();
	});

	it("should display both GitHub and Google OAuth options", () => {
		render(<LoginPage />);
		expect(screen.getByText(/github/i)).toBeInTheDocument();
		expect(screen.getByText(/google/i)).toBeInTheDocument();
	});
});
