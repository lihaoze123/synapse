import type { ApiResponse, Post, User } from "../types";
import api from "./api";

export interface UpdateProfileRequest {
	username?: string;
	avatarUrl?: string;
}

export interface UserPostsPage {
	content: Post[];
	totalElements: number;
	totalPages: number;
	number: number;
	size: number;
	first: boolean;
	last: boolean;
}

export interface UploadResponse {
	filename: string;
	url: string;
}

export const userService = {
	async getUser(id: number): Promise<User> {
		const response = await api.get<ApiResponse<User>>(`/users/${id}`);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch user");
	},

	async getUserByUsername(username: string): Promise<User> {
		const response = await api.get<ApiResponse<User>>(
			`/users/username/${username}`,
		);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch user");
	},

	async getUserPosts(id: number, page = 0, size = 10): Promise<UserPostsPage> {
		const response = await api.get<ApiResponse<UserPostsPage>>(
			`/users/${id}/posts?page=${page}&size=${size}`,
		);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch user posts");
	},

	async updateProfile(data: UpdateProfileRequest): Promise<User> {
		const response = await api.put<ApiResponse<User>>("/users/profile", data);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to update profile");
	},

	async uploadFile(file: File): Promise<UploadResponse> {
		const formData = new FormData();
		formData.append("file", file);

		const response = await api.post<ApiResponse<UploadResponse>>(
			"/upload",
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			},
		);

		if (response.data.success && response.data.data) {
			const data = response.data.data;
			// 存储相对路径，显示时再添加 STATIC_BASE_URL
			return data;
		}
		throw new Error(response.data.message || "Failed to upload file");
	},
};
