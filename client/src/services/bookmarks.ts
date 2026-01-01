import type { ApiResponse, Bookmark, Page } from "../types";
import api from "./api";

export interface GetBookmarksParams {
	page?: number;
	size?: number;
}

export type BookmarksPage = Page<Bookmark>;

export const bookmarksService = {
	async getCount(postId: number): Promise<number> {
		const response = await api.get<ApiResponse<number>>(
			`/bookmarks/posts/${postId}/count`,
		);

		if (response.data.success) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch bookmark count");
	},

	async check(postId: number): Promise<boolean> {
		const response = await api.get<ApiResponse<boolean>>(
			`/bookmarks/posts/${postId}`,
		);

		if (response.data.success) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch bookmark status");
	},

	async add(postId: number): Promise<Bookmark> {
		const response = await api.post<ApiResponse<Bookmark>>(
			`/bookmarks/posts/${postId}`,
		);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to add bookmark");
	},

	async remove(postId: number): Promise<void> {
		const response = await api.delete<ApiResponse<void>>(
			`/bookmarks/posts/${postId}`,
		);

		if (!response.data.success) {
			throw new Error(response.data.message || "Failed to remove bookmark");
		}
	},

	async list(params: GetBookmarksParams = {}): Promise<BookmarksPage> {
		const { page = 0, size = 10 } = params;
		const searchParams = new URLSearchParams();
		searchParams.append("page", String(page));
		searchParams.append("size", String(size));

		const response = await api.get<ApiResponse<BookmarksPage>>(
			`/bookmarks?${searchParams.toString()}`,
		);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch bookmarks");
	},
};
