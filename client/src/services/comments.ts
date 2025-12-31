import type { ApiResponse, Comment } from "../types";
import api from "./api";

export interface CommentsPage {
	content: Comment[];
	totalElements: number;
	totalPages: number;
	number: number;
	size: number;
	first: boolean;
	last: boolean;
}

export interface CreateCommentRequest {
	content: string;
	parentId?: number;
}

export interface UpdateCommentRequest {
	content: string;
}

export const commentsService = {
	async getPostComments(
		postId: number,
		page = 0,
		size = 20,
	): Promise<CommentsPage> {
		const response = await api.get<ApiResponse<CommentsPage>>(
			`/posts/${postId}/comments?page=${page}&size=${size}`,
		);
		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch comments");
	},

	async getComment(id: number): Promise<Comment> {
		const response = await api.get<ApiResponse<Comment>>(`/comments/${id}`);
		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch comment");
	},

	async createComment(
		postId: number,
		data: CreateCommentRequest,
	): Promise<Comment> {
		const response = await api.post<ApiResponse<Comment>>(
			`/posts/${postId}/comments`,
			data,
		);
		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to create comment");
	},

	async updateComment(
		id: number,
		data: UpdateCommentRequest,
	): Promise<Comment> {
		const response = await api.put<ApiResponse<Comment>>(
			`/comments/${id}`,
			data,
		);
		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to update comment");
	},

	async deleteComment(id: number): Promise<void> {
		const response = await api.delete<ApiResponse<void>>(`/comments/${id}`);
		if (!response.data.success) {
			throw new Error(response.data.message || "Failed to delete comment");
		}
	},
};
