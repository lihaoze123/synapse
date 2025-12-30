import type { ApiResponse, Tag } from "../types";
import api from "./api";

export const tagsService = {
	async getPopularTags(limit = 10): Promise<Tag[]> {
		const response = await api.get<ApiResponse<Tag[]>>(`/tags?limit=${limit}`);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch tags");
	},

	async getAllTags(): Promise<Tag[]> {
		const response = await api.get<ApiResponse<Tag[]>>("/tags/all");

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch tags");
	},
};
