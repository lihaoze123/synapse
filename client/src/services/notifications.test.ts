import { describe, expect, it, vi } from "vitest";
import api from "./api";
import { notificationsService } from "./notifications";

vi.mock("./api");

const mockApi = vi.mocked(api, { deep: true });

describe("notificationsService", () => {
	describe("list", () => {
		it("should fetch notifications with default params", async () => {
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
						post: { id: 1, title: "Test Post", type: "ARTICLE" as const },
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
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockPage },
			});

			const result = await notificationsService.list();

			expect(result).toEqual(mockPage);
			expect(mockApi.get).toHaveBeenCalledWith("/notifications?page=0&size=20");
		});

		it("should fetch notifications with pagination", async () => {
			mockApi.get.mockResolvedValue({
				data: {
					success: true,
					data: {
						content: [],
						totalElements: 0,
						totalPages: 0,
						number: 0,
						last: true,
					},
				},
			});

			await notificationsService.list({ page: 1, size: 30 });

			expect(mockApi.get).toHaveBeenCalledWith("/notifications?page=1&size=30");
		});

		it("should throw error on failed fetch", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "Unauthorized" },
			});

			await expect(notificationsService.list()).rejects.toThrow("Unauthorized");
		});
	});

	describe("getUnreadCount", () => {
		it("should fetch unread count", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: true, data: 5 },
			});

			const result = await notificationsService.getUnreadCount();

			expect(result).toBe(5);
			expect(mockApi.get).toHaveBeenCalledWith("/notifications/unread-count");
		});

		it("should return zero when no unread notifications", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: true, data: 0 },
			});

			const result = await notificationsService.getUnreadCount();

			expect(result).toBe(0);
		});

		it("should throw error on failed fetch", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "Unauthorized" },
			});

			await expect(notificationsService.getUnreadCount()).rejects.toThrow(
				"Unauthorized",
			);
		});
	});

	describe("markAsRead", () => {
		it("should mark notification as read", async () => {
			mockApi.post.mockResolvedValue({
				data: { success: true },
			});

			await notificationsService.markAsRead(1);

			expect(mockApi.post).toHaveBeenCalledWith("/notifications/read/1");
		});

		it("should throw error on failed mark", async () => {
			mockApi.post.mockResolvedValue({
				data: { success: false, message: "Notification not found" },
			});

			await expect(notificationsService.markAsRead(999)).rejects.toThrow(
				"Notification not found",
			);
		});
	});

	describe("markAllAsRead", () => {
		it("should mark all notifications as read", async () => {
			mockApi.post.mockResolvedValue({
				data: { success: true },
			});

			await notificationsService.markAllAsRead();

			expect(mockApi.post).toHaveBeenCalledWith("/notifications/read-all");
		});

		it("should throw error on failed mark all", async () => {
			mockApi.post.mockResolvedValue({
				data: { success: false, message: "Service unavailable" },
			});

			await expect(notificationsService.markAllAsRead()).rejects.toThrow(
				"Service unavailable",
			);
		});
	});
});
