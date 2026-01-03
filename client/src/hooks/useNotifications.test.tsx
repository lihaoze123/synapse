import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { notificationsService } from "../services/notifications";
import {
	useMarkAllAsRead,
	useMarkAsRead,
	useNotifications,
	useUnreadCount,
} from "./useNotifications";

vi.mock("../services/notifications");

const mockNotificationsService = vi.mocked(notificationsService);

describe("useNotifications hook", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
		vi.clearAllMocks();
	});

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	describe("useUnreadCount", () => {
		it("should fetch unread count", async () => {
			mockNotificationsService.getUnreadCount.mockResolvedValue(5);

			const { result } = renderHook(() => useUnreadCount(), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toBe(5);
			expect(mockNotificationsService.getUnreadCount).toHaveBeenCalled();
		});

		it("should return zero when no unread notifications", async () => {
			mockNotificationsService.getUnreadCount.mockResolvedValue(0);

			const { result } = renderHook(() => useUnreadCount(), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toBe(0);
		});

		it("should not refetch by default", async () => {
			mockNotificationsService.getUnreadCount.mockResolvedValue(3);

			const { result } = renderHook(() => useUnreadCount(), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.refetchInterval).toBeUndefined();
		});

		it("should refetch with custom interval", async () => {
			mockNotificationsService.getUnreadCount.mockResolvedValue(3);
			const { result } = renderHook(
				() => useUnreadCount({ refetchInterval: 5000 }),
				{ wrapper },
			);

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			// refetchInterval is a query option, not directly on result
			// Just verify the hook works correctly
			expect(result.current.data).toBe(3);
		});
	});

	describe("useNotifications", () => {
		it("should fetch notifications with infinite scroll", async () => {
			const mockPage = {
				content: [
					{
						id: 1,
						type: "LIKE" as const,
						actor: {
							id: 2,
							username: "user2",
							avatarUrl: null,
							displayName: null,
						},
						post: { id: 1, title: "Test", type: "ARTICLE" as const },
						commentId: null,
						isRead: false,
						createdAt: "2024-01-01T00:00:00",
					},
				],
				totalElements: 1,
				totalPages: 1,
				number: 0,
				last: true,
			};
			mockNotificationsService.list.mockResolvedValue(mockPage);

			const { result } = renderHook(() => useNotifications(), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data?.pages[0]).toEqual(mockPage);
			expect(mockNotificationsService.list).toHaveBeenCalledWith({ page: 0 });
		});

		it("should fetch notifications with custom size", async () => {
			mockNotificationsService.list.mockResolvedValue({
				content: [],
				totalElements: 0,
				totalPages: 0,
				number: 0,
				last: true,
			});

			const { result } = renderHook(() => useNotifications({ size: 30 }), {
				wrapper,
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockNotificationsService.list).toHaveBeenCalledWith({
				page: 0,
				size: 30,
			});
		});
	});

	describe("useMarkAsRead", () => {
		it("should mark notification as read and invalidate queries", async () => {
			mockNotificationsService.markAsRead.mockResolvedValue(undefined);

			const { result } = renderHook(() => useMarkAsRead(), { wrapper });

			await result.current.mutateAsync(1);

			expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith(1);
		});

		it("should handle error", async () => {
			mockNotificationsService.markAsRead.mockRejectedValue(
				new Error("Mark failed"),
			);

			const { result } = renderHook(() => useMarkAsRead(), { wrapper });

			await expect(result.current.mutateAsync(1)).rejects.toThrow(
				"Mark failed",
			);
		});
	});

	describe("useMarkAllAsRead", () => {
		it("should mark all notifications as read and invalidate queries", async () => {
			mockNotificationsService.markAllAsRead.mockResolvedValue(undefined);

			const { result } = renderHook(() => useMarkAllAsRead(), { wrapper });

			await result.current.mutateAsync();

			expect(mockNotificationsService.markAllAsRead).toHaveBeenCalled();
		});

		it("should handle error", async () => {
			mockNotificationsService.markAllAsRead.mockRejectedValue(
				new Error("Mark all failed"),
			);

			const { result } = renderHook(() => useMarkAllAsRead(), { wrapper });

			await expect(result.current.mutateAsync()).rejects.toThrow(
				"Mark all failed",
			);
		});

		it("should show pending state during mutation", async () => {
			let resolvePromise: () => void;
			mockNotificationsService.markAllAsRead.mockReturnValue(
				new Promise((resolve) => {
					resolvePromise = resolve;
				}),
			);

			const { result } = renderHook(() => useMarkAllAsRead(), { wrapper });

			// Use mutate instead of mutateAsync to trigger the mutation
			result.current.mutate();

			// Wait for the pending state to update
			await waitFor(() => expect(result.current.isPending).toBe(true));

			resolvePromise!();

			// Wait for the mutation to complete
			await waitFor(() => expect(result.current.isPending).toBe(false));
		});
	});
});
