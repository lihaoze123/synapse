export interface User {
	id: number;
	username: string;
	avatarUrl: string | null;
}

export interface AuthResponse {
	token: string;
	user: User;
}

export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data: T;
}

export type PostType = "SNIPPET" | "ARTICLE" | "MOMENT";

export interface Tag {
	id: number;
	name: string;
	icon: string | null;
}

export interface Post {
	id: number;
	type: PostType;
	title: string | null;
	content: string;
	language: string | null;
	summary: string | null;
	coverImage: string | null;
	user: User;
	tags: Tag[];
	createdAt: string;
}
