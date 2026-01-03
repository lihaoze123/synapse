import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authService } from "../services/auth";
import { useAuth } from "./useAuth";

vi.mock("../services/auth");

const mockAuthService = vi.mocked(authService);

// Mock TanStack Router's useNavigate
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => mockNavigate,
}));

describe("useAuth hook", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
		vi.clearAllMocks();
		localStorage.clear();
		mockNavigate.mockReset();
	});

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	describe("authentication state", () => {
		it("should return null user when not authenticated", async () => {
			mockAuthService.getToken.mockReturnValue(null);
			mockAuthService.getUser.mockReturnValue(null);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => expect(result.current.isValidating).toBe(false));

			expect(result.current.user).toBeNull();
			expect(result.current.isAuthenticated).toBe(false);
		});

		it("should return user from localStorage", async () => {
			const mockUser = { id: 1, username: "test", avatarUrl: null };
			mockAuthService.getToken.mockReturnValue("token");
			mockAuthService.getUser.mockReturnValue(mockUser);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => expect(result.current.isValidating).toBe(false));

			expect(result.current.user).toEqual(mockUser);
			expect(result.current.isAuthenticated).toBe(true);
		});

		it("should fetch current user when token exists", async () => {
			const mockUser = { id: 1, username: "test", avatarUrl: null };
			mockAuthService.getToken.mockReturnValue("token");
			mockAuthService.getUser.mockReturnValue(null);
			mockAuthService.fetchCurrentUser.mockResolvedValue(mockUser);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => expect(result.current.isValidating).toBe(false));

			expect(mockAuthService.fetchCurrentUser).toHaveBeenCalled();
			expect(result.current.user).toEqual(mockUser);
		});

		it("should logout on fetchCurrentUser error", async () => {
			mockAuthService.getToken.mockReturnValue("invalid-token");
			mockAuthService.getUser.mockReturnValue(null);
			mockAuthService.fetchCurrentUser.mockRejectedValue(
				new Error("Unauthorized"),
			);
			mockAuthService.logout.mockReturnValue(undefined);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await waitFor(() => expect(result.current.isValidating).toBe(false));

			expect(mockAuthService.logout).toHaveBeenCalled();
			expect(result.current.user).toBeNull();
		});
	});

	describe("login", () => {
		it("should login with auth service", async () => {
			const mockAuthResponse = {
				token: "new-token",
				user: { id: 1, username: "testuser", avatarUrl: null },
			};
			mockAuthService.getToken.mockReturnValue(null);
			mockAuthService.getUser.mockReturnValue(null);
			mockAuthService.login.mockResolvedValue(mockAuthResponse);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await result.current.login({ username: "test", password: "pass" });

			expect(mockAuthService.login).toHaveBeenCalledWith(
				{ username: "test", password: "pass" },
				expect.any(Object),
			);
		});

		it("should handle login error", async () => {
			mockAuthService.getToken.mockReturnValue(null);
			mockAuthService.getUser.mockReturnValue(null);
			mockAuthService.login.mockRejectedValue(new Error("Invalid credentials"));

			const { result } = renderHook(() => useAuth(), { wrapper });

			await expect(
				result.current.login({ username: "test", password: "wrong" }),
			).rejects.toThrow("Invalid credentials");

			expect(result.current.loginError).toBeDefined();
		});

		it("should show pending state during login", async () => {
			let resolvePromise: (value: {
				token: string;
				user: { id: number; username: string; avatarUrl: null };
			}) => void;
			mockAuthService.getToken.mockReturnValue(null);
			mockAuthService.getUser.mockReturnValue(null);
			mockAuthService.login.mockReturnValue(
				new Promise((resolve) => {
					resolvePromise = resolve;
				}),
			);

			const { result } = renderHook(() => useAuth(), { wrapper });

			result.current.login({ username: "test", password: "pass" });

			await waitFor(() => expect(result.current.isLoggingIn).toBe(true));

			resolvePromise!({
				token: "token",
				user: { id: 1, username: "test", avatarUrl: null },
			});

			await waitFor(() => expect(result.current.isLoggingIn).toBe(false));
		});
	});

	describe("register", () => {
		it("should register with auth service", async () => {
			const mockAuthResponse = {
				token: "new-token",
				user: { id: 1, username: "newuser", avatarUrl: null },
			};
			mockAuthService.getToken.mockReturnValue(null);
			mockAuthService.getUser.mockReturnValue(null);
			mockAuthService.register.mockResolvedValue(mockAuthResponse);

			const { result } = renderHook(() => useAuth(), { wrapper });

			await result.current.register({ username: "newuser", password: "pass" });

			expect(mockAuthService.register).toHaveBeenCalledWith(
				{ username: "newuser", password: "pass" },
				expect.any(Object),
			);
		});

		it("should handle register error", async () => {
			mockAuthService.getToken.mockReturnValue(null);
			mockAuthService.getUser.mockReturnValue(null);
			mockAuthService.register.mockRejectedValue(new Error("Username taken"));

			const { result } = renderHook(() => useAuth(), { wrapper });

			await expect(
				result.current.register({ username: "existing", password: "pass" }),
			).rejects.toThrow("Username taken");

			expect(result.current.registerError).toBeDefined();
		});

		it("should show pending state during register", async () => {
			let resolvePromise: (value: {
				token: string;
				user: { id: number; username: string; avatarUrl: null };
			}) => void;
			mockAuthService.getToken.mockReturnValue(null);
			mockAuthService.getUser.mockReturnValue(null);
			mockAuthService.register.mockReturnValue(
				new Promise((resolve) => {
					resolvePromise = resolve;
				}),
			);

			const { result } = renderHook(() => useAuth(), { wrapper });

			result.current.register({
				username: "newuser",
				password: "pass",
			});

			await waitFor(() => expect(result.current.isRegistering).toBe(true));

			resolvePromise!({
				token: "token",
				user: { id: 1, username: "newuser", avatarUrl: null },
			});

			await waitFor(() => expect(result.current.isRegistering).toBe(false));
		});
	});

	describe("logout", () => {
		it("should logout with auth service", async () => {
			const mockUser = { id: 1, username: "test", avatarUrl: null };
			mockAuthService.getToken.mockReturnValue("token");
			mockAuthService.getUser.mockReturnValue(mockUser);
			mockAuthService.logout.mockReturnValue(undefined);

			const { result } = renderHook(() => useAuth(), { wrapper });

			// Wait for initial auth check to complete
			await waitFor(() => expect(result.current.isValidating).toBe(false));

			result.current.logout();

			expect(mockAuthService.logout).toHaveBeenCalled();
			expect(mockNavigate).toHaveBeenCalledWith({
				to: "/login",
				replace: true,
			});
		});
	});
});
