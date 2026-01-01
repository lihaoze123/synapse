import type { ApiResponse } from "@/types";
import api from "./api";

export interface ToggleLikeResponse {
	liked: boolean;
	count: number;
}

export const likesService = {
	async togglePost(postId: number): Promise<ToggleLikeResponse> {
		const response = await api.post<ApiResponse<ToggleLikeResponse>>(
			`/likes/posts/${postId}`,
		);
		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to toggle like");
	},
	async toggleComment(commentId: number): Promise<ToggleLikeResponse> {
		const response = await api.post<ApiResponse<ToggleLikeResponse>>(
			`/comment-likes/${commentId}`,
		);
		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to toggle like");
	},
};
