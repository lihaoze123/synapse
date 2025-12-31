import type {
	ApiResponse,
	FollowCounts,
	FollowDto,
	FollowsPage,
} from "../types";
import api from "./api";

export const followsService = {
	async getFollowing(
		userId: number,
		page = 0,
		size = 20,
	): Promise<FollowsPage> {
		const response = await api.get<ApiResponse<FollowsPage>>(
			`/follows/following?userId=${userId}&page=${page}&size=${size}`,
		);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch following list");
	},

	async getFollowers(
		userId: number,
		page = 0,
		size = 20,
	): Promise<FollowsPage> {
		const response = await api.get<ApiResponse<FollowsPage>>(
			`/follows/followers?userId=${userId}&page=${page}&size=${size}`,
		);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch followers list");
	},

	async checkFollowing(userId: number): Promise<boolean> {
		const response = await api.get<ApiResponse<boolean>>(
			`/follows/check/${userId}`,
		);

		if (response.data.success) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to check follow status");
	},

	async getFollowCounts(userId: number): Promise<FollowCounts> {
		const response = await api.get<ApiResponse<FollowCounts>>(
			`/follows/counts/${userId}`,
		);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch follow counts");
	},

	async followUser(userId: number): Promise<FollowDto> {
		const response = await api.post<ApiResponse<FollowDto>>(
			`/follows/${userId}`,
		);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to follow user");
	},

	async unfollowUser(userId: number): Promise<void> {
		const response = await api.delete<ApiResponse<void>>(`/follows/${userId}`);

		if (!response.data.success) {
			throw new Error(response.data.message || "Failed to unfollow user");
		}
	},
};
