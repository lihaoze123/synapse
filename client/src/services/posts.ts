import type { ApiResponse, Post, PostType } from "../types";
import api from "./api";

export interface CreatePostRequest {
	type: PostType;
	title?: string;
	content: string;
	language?: string;
	coverImage?: string;
	images?: string[];
	tags?: string[];
}

export interface PostsPage {
	content: Post[];
	totalElements: number;
	totalPages: number;
	number: number;
	size: number;
	first: boolean;
	last: boolean;
}

export interface GetPostsParams {
	tag?: string;
	type?: PostType;
	page?: number;
	size?: number;
}

export const postsService = {
	async getPosts(params: GetPostsParams = {}): Promise<PostsPage> {
		const { tag, type, page = 0, size = 10 } = params;
		const searchParams = new URLSearchParams();

		if (tag) searchParams.append("tag", tag);
		if (type) searchParams.append("type", type);
		searchParams.append("page", String(page));
		searchParams.append("size", String(size));

		const response = await api.get<ApiResponse<PostsPage>>(
			`/posts?${searchParams.toString()}`,
		);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch posts");
	},

	async getPost(id: number): Promise<Post> {
		const response = await api.get<ApiResponse<Post>>(`/posts/${id}`);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to fetch post");
	},

	async createPost(data: CreatePostRequest): Promise<Post> {
		const response = await api.post<ApiResponse<Post>>("/posts", data);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to create post");
	},

	async updatePost(id: number, data: CreatePostRequest): Promise<Post> {
		const response = await api.put<ApiResponse<Post>>(`/posts/${id}`, data);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to update post");
	},

	async deletePost(id: number): Promise<void> {
		const response = await api.delete<ApiResponse<void>>(`/posts/${id}`);

		if (!response.data.success) {
			throw new Error(response.data.message || "Failed to delete post");
		}
	},

	async searchPosts(
		params: GetPostsParams & { keyword: string },
	): Promise<PostsPage> {
		const { keyword, tag, type, page = 0, size = 10 } = params;
		const searchParams = new URLSearchParams();

		searchParams.append("keyword", keyword);
		if (type) searchParams.append("type", type);
		if (tag) searchParams.append("tag", tag);
		searchParams.append("page", String(page));
		searchParams.append("size", String(size));

		const response = await api.get<ApiResponse<PostsPage>>(
			`/posts/search?${searchParams.toString()}`,
		);

		if (response.data.success && response.data.data) {
			return response.data.data;
		}
		throw new Error(response.data.message || "Failed to search posts");
	},
};
