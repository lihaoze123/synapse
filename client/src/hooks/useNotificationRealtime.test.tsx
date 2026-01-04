import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

type MockJsonMessage =
	| { type: "unreadCount"; count: number }
	| { type: "notification"; data?: unknown }
	| null
	| string
	| number[]
	| { data: string }
	| { type: string; count?: number; id?: number; data?: unknown };

// Mock react-use-websocket before importing the hook
const mockReturnValue = {
	lastJsonMessage: null as MockJsonMessage,
	readyState: 3,
	sendMessage: vi.fn(),
	sendJsonMessage: vi.fn(),
	getWebSocket: vi.fn(),
};

vi.mock("react-use-websocket", () => ({
	default: vi.fn(() => mockReturnValue),
}));

import useWebSocket from "react-use-websocket";
import { useNotificationRealtime } from "./useNotificationRealtime";

const mockedUseWebSocket = vi.mocked(useWebSocket);

describe("useNotificationRealtime hook", () => {
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

		// Reset mock to default state
		mockReturnValue.lastJsonMessage = null;

		// Mock window.location
		delete (window as Partial<Window>).location;
		window.location = {
			...window.location,
			protocol: "http:",
			host: "localhost:3000",
		} as never;
	});

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	describe("WebSocket connection", () => {
		it("should not connect when no token exists", () => {
			renderHook(() => useNotificationRealtime(), { wrapper });

			expect(mockedUseWebSocket).toHaveBeenCalledWith(null, expect.any(Object));
		});

		it("should connect with WebSocket URL when token exists", () => {
			const token = "test-token-123";
			localStorage.setItem("token", token);

			renderHook(() => useNotificationRealtime(), { wrapper });

			const expectedUrl =
				"ws://localhost:3000/api/ws/notifications?token=test-token-123";
			expect(mockedUseWebSocket).toHaveBeenCalledWith(
				expectedUrl,
				expect.any(Object),
			);
		});

		it("should use WSS protocol when on HTTPS", () => {
			window.location.protocol = "https:";
			const token = "secure-token";
			localStorage.setItem("token", token);

			renderHook(() => useNotificationRealtime(), { wrapper });

			const expectedUrl =
				"wss://localhost:3000/api/ws/notifications?token=secure-token";
			expect(mockedUseWebSocket).toHaveBeenCalledWith(
				expectedUrl,
				expect.any(Object),
			);
		});

		it("should use custom API base URL from env", () => {
			const originalApiBase = import.meta.env.VITE_API_BASE_URL;
			import.meta.env.VITE_API_BASE_URL = "https://api.example.com";

			const token = "custom-token";
			localStorage.setItem("token", token);

			renderHook(() => useNotificationRealtime(), { wrapper });

			const expectedUrl =
				"wss://api.example.com/ws/notifications?token=custom-token";
			expect(mockedUseWebSocket).toHaveBeenCalledWith(
				expectedUrl,
				expect.any(Object),
			);

			import.meta.env.VITE_API_BASE_URL = originalApiBase;
		});

		it("should configure reconnect options", () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			renderHook(() => useNotificationRealtime(), { wrapper });

			const options = mockedUseWebSocket.mock.calls[0]?.[1];
			if (!options) throw new Error("Options should be defined");
			expect(options).toMatchObject({
				reconnectAttempts: 10,
				reconnectInterval: 1000,
			});
			expect(typeof options.shouldReconnect).toBe("function");
		});

		it("should always attempt to reconnect", () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			renderHook(() => useNotificationRealtime(), { wrapper });

			const options = mockedUseWebSocket.mock.calls[0]?.[1];
			if (!options?.shouldReconnect)
				throw new Error("Options should be defined");
			const mockCloseEvent = {} as CloseEvent;
			expect(options.shouldReconnect(mockCloseEvent)).toBe(true);
		});
	});

	describe("unreadCount message handling", () => {
		it("should update unread count query data on unreadCount message", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			queryClient.setQueryData(["notifications", "unread-count"], 5);
			mockReturnValue.lastJsonMessage = { type: "unreadCount", count: 10 };

			renderHook(() => useNotificationRealtime(), { wrapper });

			await waitFor(() => {
				const unreadCount = queryClient.getQueryData([
					"notifications",
					"unread-count",
				]);
				expect(unreadCount).toBe(10);
			});
		});

		it("should handle zero unread count", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			queryClient.setQueryData(["notifications", "unread-count"], 5);
			mockReturnValue.lastJsonMessage = { type: "unreadCount", count: 0 };

			renderHook(() => useNotificationRealtime(), { wrapper });

			await waitFor(() => {
				const unreadCount = queryClient.getQueryData([
					"notifications",
					"unread-count",
				]);
				expect(unreadCount).toBe(0);
			});
		});

		it("should set unread count when none exists", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			mockReturnValue.lastJsonMessage = { type: "unreadCount", count: 3 };

			renderHook(() => useNotificationRealtime(), { wrapper });

			await waitFor(() => {
				const unreadCount = queryClient.getQueryData([
					"notifications",
					"unread-count",
				]);
				expect(unreadCount).toBe(3);
			});
		});

		it("should not update query data for invalid count values", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			queryClient.setQueryData(["notifications", "unread-count"], 5);
			mockReturnValue.lastJsonMessage = {
				type: "unreadCount",
				count: "invalid" as never,
			};

			renderHook(() => useNotificationRealtime(), { wrapper });

			await waitFor(() => {
				const unreadCount = queryClient.getQueryData([
					"notifications",
					"unread-count",
				]);
				expect(unreadCount).toBe(5);
			});
		});

		it("should handle NaN count gracefully", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			queryClient.setQueryData(["notifications", "unread-count"], 5);
			mockReturnValue.lastJsonMessage = { type: "unreadCount", count: NaN };

			renderHook(() => useNotificationRealtime(), { wrapper });

			await waitFor(() => {
				const unreadCount = queryClient.getQueryData([
					"notifications",
					"unread-count",
				]);
				expect(unreadCount).toBe(5);
			});
		});
	});

	describe("notification message handling", () => {
		it("should invalidate notifications list on notification message", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
			mockReturnValue.lastJsonMessage = { type: "notification" };

			renderHook(() => useNotificationRealtime(), { wrapper });

			await waitFor(() => {
				expect(invalidateQueriesSpy).toHaveBeenCalledWith({
					queryKey: ["notifications", "list"],
				});
			});
		});

		it("should invalidate notifications list with data payload", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
			mockReturnValue.lastJsonMessage = {
				type: "notification",
				data: { id: 1, message: "New like" },
			};

			renderHook(() => useNotificationRealtime(), { wrapper });

			await waitFor(() => {
				expect(invalidateQueriesSpy).toHaveBeenCalledWith({
					queryKey: ["notifications", "list"],
				});
			});
		});
	});

	describe("message handling edge cases", () => {
		it("should ignore null messages", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
			const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
			mockReturnValue.lastJsonMessage = null;

			renderHook(() => useNotificationRealtime(), { wrapper });

			await waitFor(() => {
				expect(setQueryDataSpy).not.toHaveBeenCalled();
				expect(invalidateQueriesSpy).not.toHaveBeenCalled();
			});
		});

		it("should ignore non-object messages", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
			const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
			mockReturnValue.lastJsonMessage = "string message";

			renderHook(() => useNotificationRealtime(), { wrapper });

			await waitFor(() => {
				expect(setQueryDataSpy).not.toHaveBeenCalled();
				expect(invalidateQueriesSpy).not.toHaveBeenCalled();
			});
		});

		it("should ignore array messages", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
			const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
			mockReturnValue.lastJsonMessage = [1, 2, 3];

			renderHook(() => useNotificationRealtime(), { wrapper });

			await waitFor(() => {
				expect(setQueryDataSpy).not.toHaveBeenCalled();
				expect(invalidateQueriesSpy).not.toHaveBeenCalled();
			});
		});

		it("should ignore messages with unknown type", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
			const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
			mockReturnValue.lastJsonMessage = { type: "unknownType", data: "test" };

			renderHook(() => useNotificationRealtime(), { wrapper });

			await waitFor(() => {
				expect(setQueryDataSpy).not.toHaveBeenCalled();
				expect(invalidateQueriesSpy).not.toHaveBeenCalled();
			});
		});

		it("should ignore messages without type field", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
			const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");
			mockReturnValue.lastJsonMessage = { data: "test" };

			renderHook(() => useNotificationRealtime(), { wrapper });

			await waitFor(() => {
				expect(setQueryDataSpy).not.toHaveBeenCalled();
				expect(invalidateQueriesSpy).not.toHaveBeenCalled();
			});
		});
	});

	describe("URL building", () => {
		it("should use http API base URL and convert to ws protocol", () => {
			const originalApiBase = import.meta.env.VITE_API_BASE_URL;
			import.meta.env.VITE_API_BASE_URL = "http://api.example.com";

			const token = "test-token";
			localStorage.setItem("token", token);

			renderHook(() => useNotificationRealtime(), { wrapper });

			const expectedUrl =
				"ws://api.example.com/ws/notifications?token=test-token";
			expect(mockedUseWebSocket).toHaveBeenCalledWith(
				expectedUrl,
				expect.any(Object),
			);

			import.meta.env.VITE_API_BASE_URL = originalApiBase;
		});

		it("should use default /api relative path when VITE_API_BASE_URL is not set", () => {
			const originalApiBase = import.meta.env.VITE_API_BASE_URL;
			import.meta.env.VITE_API_BASE_URL = "";

			const token = "test-token";
			localStorage.setItem("token", token);

			renderHook(() => useNotificationRealtime(), { wrapper });

			const expectedUrl =
				"ws://localhost:3000/api/ws/notifications?token=test-token";
			expect(mockedUseWebSocket).toHaveBeenCalledWith(
				expectedUrl,
				expect.any(Object),
			);

			import.meta.env.VITE_API_BASE_URL = originalApiBase;
		});

		it("should handle malformed URL that throws error in catch block", () => {
			const originalApiBase = import.meta.env.VITE_API_BASE_URL;
			// This URL will cause new URL() to throw TypeError due to invalid format
			import.meta.env.VITE_API_BASE_URL = "http://";

			const token = "test-token";
			localStorage.setItem("token", token);

			renderHook(() => useNotificationRealtime(), { wrapper });

			// When new URL() throws, buildWebSocketUrl returns null
			// So wsUrl is null, and final url is null
			expect(mockedUseWebSocket).toHaveBeenCalledWith(null, expect.any(Object));

			import.meta.env.VITE_API_BASE_URL = originalApiBase;
		});

		it("should encode token in URL query parameter", () => {
			const token = "token with spaces & special=chars";
			localStorage.setItem("token", token);

			renderHook(() => useNotificationRealtime(), { wrapper });

			const call = mockedUseWebSocket.mock.calls[0];
			const url = call[0] as string;
			expect(url).toContain("token=");
			expect(url).toContain("token%20with%20spaces%20%26%20special%3Dchars");
		});

		it("should remove trailing slash from API base URL", () => {
			const originalApiBase = import.meta.env.VITE_API_BASE_URL;
			import.meta.env.VITE_API_BASE_URL = "https://api.example.com/";

			const token = "test-token";
			localStorage.setItem("token", token);

			renderHook(() => useNotificationRealtime(), { wrapper });

			const expectedUrl =
				"wss://api.example.com/ws/notifications?token=test-token";
			expect(mockedUseWebSocket).toHaveBeenCalledWith(
				expectedUrl,
				expect.any(Object),
			);

			import.meta.env.VITE_API_BASE_URL = originalApiBase;
		});
	});

	describe("integration scenarios", () => {
		it("should handle multiple sequential messages", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			mockReturnValue.lastJsonMessage = { type: "unreadCount", count: 5 };

			const { rerender } = renderHook(() => useNotificationRealtime(), {
				wrapper,
			});

			await waitFor(() => {
				const unreadCount = queryClient.getQueryData([
					"notifications",
					"unread-count",
				]);
				expect(unreadCount).toBe(5);
			});

			mockReturnValue.lastJsonMessage = { type: "notification", id: 1 };
			const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

			rerender();

			await waitFor(() => {
				expect(invalidateQueriesSpy).toHaveBeenCalledWith({
					queryKey: ["notifications", "list"],
				});
			});
		});

		it("should handle reconnection with new messages", async () => {
			const token = "test-token";
			localStorage.setItem("token", token);

			mockReturnValue.lastJsonMessage = { type: "unreadCount", count: 1 };

			const { rerender } = renderHook(() => useNotificationRealtime(), {
				wrapper,
			});

			await waitFor(() => {
				const unreadCount = queryClient.getQueryData([
					"notifications",
					"unread-count",
				]);
				expect(unreadCount).toBe(1);
			});

			mockReturnValue.lastJsonMessage = { type: "unreadCount", count: 7 };

			rerender();

			await waitFor(() => {
				const unreadCount = queryClient.getQueryData([
					"notifications",
					"unread-count",
				]);
				expect(unreadCount).toBe(7);
			});
		});
	});
});
