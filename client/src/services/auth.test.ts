import { describe, expect, it, vi } from "vitest";
import api from "./api";
import { authService } from "./auth";

vi.mock("./api");

const mockApi = vi.mocked(api, { deep: true });

describe("authService", () => {
	describe("login", () => {
		it("should store token and user on successful login", async () => {
			const mockResponse = {
				data: {
					success: true,
					data: {
						token: "test-token",
						user: { id: 1, username: "testuser", avatarUrl: null },
					},
				},
			};
			mockApi.post.mockResolvedValue(mockResponse);

			const result = await authService.login({
				username: "test",
				password: "pass",
			});

			expect(result.token).toBe("test-token");
			expect(result.user.username).toBe("testuser");
			expect(localStorage.getItem("token")).toBe("test-token");
			expect(localStorage.getItem("user")).toBe(JSON.stringify(result.user));
		});

		it("should throw error on failed login", async () => {
			const mockResponse = {
				data: { success: false, message: "Invalid credentials" },
			};
			mockApi.post.mockResolvedValue(mockResponse);

			await expect(
				authService.login({ username: "test", password: "wrong" }),
			).rejects.toThrow("Invalid credentials");
		});
	});

	describe("register", () => {
		it("should store token and user on successful registration", async () => {
			const mockResponse = {
				data: {
					success: true,
					data: {
						token: "new-token",
						user: { id: 2, username: "newuser", avatarUrl: null },
					},
				},
			};
			mockApi.post.mockResolvedValue(mockResponse);

			const result = await authService.register({
				username: "newuser",
				email: "newuser@test.com",
				password: "pass",
			});

			expect(result.token).toBe("new-token");
			expect(localStorage.getItem("token")).toBe("new-token");
			expect(localStorage.getItem("user")).toBe(JSON.stringify(result.user));
		});

		it("should include avatarUrl in registration request", async () => {
			const mockResponse = {
				data: {
					success: true,
					data: {
						token: "token",
						user: { id: 1, username: "user", avatarUrl: "avatar.png" },
					},
				},
			};
			mockApi.post.mockResolvedValue(mockResponse);

			await authService.register({
				username: "user",
				email: "user@test.com",
				password: "pass",
				avatarUrl: "avatar.png",
			});

			expect(mockApi.post).toHaveBeenCalledWith("/auth/register", {
				username: "user",
				email: "user@test.com",
				password: "pass",
				avatarUrl: "avatar.png",
			});
		});
	});

	describe("logout", () => {
		it("should remove token and user from localStorage", () => {
			localStorage.setItem("token", "test-token");
			localStorage.setItem("user", JSON.stringify({ id: 1 }));

			authService.logout();

			expect(localStorage.getItem("token")).toBeNull();
			expect(localStorage.getItem("user")).toBeNull();
		});
	});

	describe("fetchCurrentUser", () => {
		it("should fetch and store user data", async () => {
			const mockUser = { id: 1, username: "testuser", avatarUrl: null };
			const mockResponse = {
				data: { success: true, data: mockUser },
			};
			mockApi.get.mockResolvedValue(mockResponse);

			const result = await authService.fetchCurrentUser();

			expect(result).toEqual(mockUser);
			expect(localStorage.getItem("user")).toBe(JSON.stringify(mockUser));
		});

		it("should throw error on fetch failure", async () => {
			const mockResponse = {
				data: { success: false, message: "Unauthorized" },
			};
			mockApi.get.mockResolvedValue(mockResponse);

			await expect(authService.fetchCurrentUser()).rejects.toThrow(
				"Unauthorized",
			);
		});
	});

	describe("getToken", () => {
		it("should return token from localStorage", () => {
			localStorage.setItem("token", "test-token");
			expect(authService.getToken()).toBe("test-token");
		});

		it("should return null when no token exists", () => {
			expect(authService.getToken()).toBeNull();
		});
	});

	describe("getUser", () => {
		it("should return parsed user from localStorage", () => {
			const user = { id: 1, username: "test", avatarUrl: null };
			localStorage.setItem("user", JSON.stringify(user));

			expect(authService.getUser()).toEqual(user);
		});

		it("should return null when no user exists", () => {
			expect(authService.getUser()).toBeNull();
		});

		it("should throw for corrupted user data", () => {
			localStorage.setItem("user", "invalid json");
			expect(() => authService.getUser()).toThrow();
		});
	});

	describe("isAuthenticated", () => {
		it("should return true when token exists", () => {
			localStorage.setItem("token", "test-token");
			expect(authService.isAuthenticated()).toBe(true);
		});

		it("should return false when no token", () => {
			expect(authService.isAuthenticated()).toBe(false);
		});
	});
});
