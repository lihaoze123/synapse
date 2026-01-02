import type { ApiResponse, Notification, Page } from "../types";
import api from "./api";

export interface GetNotificationsParams {
	page?: number;
	size?: number;
}

export type NotificationsPage = Page<Notification>;

export const notificationsService = {
	async list(params: GetNotificationsParams = {}): Promise<NotificationsPage> {
		const { page = 0, size = 20 } = params;
		const searchParams = new URLSearchParams();
		searchParams.append("page", String(page));
		searchParams.append("size", String(size));

		const response = await api.get<ApiResponse<NotificationsPage>>(
			`/notifications?${searchParams.toString()}`,
		);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch notifications");
	},

	async getUnreadCount(): Promise<number> {
		const response = await api.get<ApiResponse<number>>(
			"/notifications/unread-count",
		);

		if (response.data.success) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch unread count");
	},

	async markAsRead(id: number): Promise<void> {
		const response = await api.post<ApiResponse<void>>(
			`/notifications/read/${id}`,
		);

		if (!response.data.success) {
			throw new Error(response.data.message || "Failed to mark as read");
		}
	},

	async markAllAsRead(): Promise<void> {
		const response = await api.post<ApiResponse<void>>(
			"/notifications/read-all",
		);

		if (!response.data.success) {
			throw new Error(response.data.message || "Failed to mark all as read");
		}
	},
};
