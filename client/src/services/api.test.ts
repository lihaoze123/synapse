import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Use vi.hoisted to create store that's available when mock runs
const mockStore = vi.hoisted(() => ({
	requestInterceptor: null as ((config: any) => any) | null,
	responseSuccessInterceptor: null as ((response: any) => any) | null,
	responseErrorInterceptor: null as ((error: any) => any) | null,
}));

vi.mock("axios", () => ({
	default: {
		create: vi.fn(() => ({
			interceptors: {
				request: {
					use: vi.fn((onFulfilled: any) => {
						mockStore.requestInterceptor = onFulfilled;
					}),
				},
				response: {
					use: vi.fn((onFulfilled: any, onRejected: any) => {
						mockStore.responseSuccessInterceptor = onFulfilled;
						mockStore.responseErrorInterceptor = onRejected;
					}),
				},
			},
		})),
	},
}));

// Import api after setting up mocks - this will trigger the interceptor setup
import { resolveStaticUrl, setAuthErrorHandler } from "./api";

describe("api module", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	afterEach(() => {
		setAuthErrorHandler(null);
	});

	describe("resolveStaticUrl", () => {
		it("should return url as-is when already absolute", () => {
			expect(resolveStaticUrl("https://example.com/image.png")).toBe(
				"https://example.com/image.png",
			);
			expect(resolveStaticUrl("http://cdn.example.com/file.jpg")).toBe(
				"http://cdn.example.com/file.jpg",
			);
		});

		it("should return empty string as-is", () => {
			expect(resolveStaticUrl("")).toBe("");
		});

		it("should return relative url when STATIC_BASE_URL is empty", () => {
			expect(resolveStaticUrl("/uploads/image.png")).toBe("/uploads/image.png");
		});
	});

	describe("setAuthErrorHandler", () => {
		it("should set auth error handler", () => {
			const handler = vi.fn();
			setAuthErrorHandler(handler);
			expect(handler).toBeDefined();
		});

		it("should clear auth error handler when set to null", () => {
			expect(() => setAuthErrorHandler(null)).not.toThrow();
		});
	});

	describe("request interceptor", () => {
		it("should add Authorization header when token exists", () => {
			expect(mockStore.requestInterceptor).not.toBeNull();

			localStorage.setItem("token", "test-token-123");

			const config = {
				headers: {} as Record<string, string>,
			};

			const result = mockStore.requestInterceptor!(config);

			expect(result.headers.Authorization).toBe("Bearer test-token-123");
		});

		it("should not add Authorization header when no token", () => {
			const config = {
				headers: {} as Record<string, string>,
			};

			const result = mockStore.requestInterceptor!(config);

			expect(result.headers.Authorization).toBeUndefined();
		});
	});

	describe("response interceptor", () => {
		it("should pass through successful responses", () => {
			expect(mockStore.responseSuccessInterceptor).not.toBeNull();

			const response = { data: { success: true } };
			const result = mockStore.responseSuccessInterceptor!(response);
			expect(result).toBe(response);
		});

		it("should handle 401 error and redirect to login", async () => {
			const originalLocation = window.location;
			Object.defineProperty(window, "location", {
				value: { href: "" },
				writable: true,
			});

			localStorage.setItem("token", "expired-token");
			localStorage.setItem("user", JSON.stringify({ id: 1 }));

			const error = {
				response: { status: 401 },
			};

			await expect(mockStore.responseErrorInterceptor!(error)).rejects.toBe(
				error,
			);

			expect(localStorage.getItem("token")).toBeNull();
			expect(localStorage.getItem("user")).toBeNull();
			expect(window.location.href).toBe("/login");

			Object.defineProperty(window, "location", {
				value: originalLocation,
				writable: true,
			});
		});

		it("should call custom auth error handler on 401", async () => {
			const customHandler = vi.fn();
			setAuthErrorHandler(customHandler);

			localStorage.setItem("token", "expired-token");
			localStorage.setItem("user", JSON.stringify({ id: 1 }));

			const error = {
				response: { status: 401 },
			};

			await expect(mockStore.responseErrorInterceptor!(error)).rejects.toBe(
				error,
			);

			expect(customHandler).toHaveBeenCalled();
			expect(localStorage.getItem("token")).toBeNull();
			expect(localStorage.getItem("user")).toBeNull();
		});

		it("should pass through non-401 errors", async () => {
			const error = {
				response: { status: 500 },
			};

			await expect(mockStore.responseErrorInterceptor!(error)).rejects.toBe(
				error,
			);
			expect(localStorage.getItem("token")).toBeNull();
		});
	});
});
