export interface User {
	id: number;
	username: string;
	avatarUrl: string | null;
	displayName?: string | null;
	bio?: string | null;
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

export interface Page<T> {
	content: T[];
	totalElements: number;
	totalPages: number;
	number: number;
	last: boolean;
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
	images: string[] | null;
	user: User;
	tags: Tag[];
	createdAt: string;
	likeCount: number;
	userState?: {
		liked: boolean;
	};
}

export interface Comment {
	id: number;
	content: string;
	user: User;
	postId: number | null;
	parentId: number | null;
	floor?: number;
	replyToFloor?: number;
	replyToUsername?: string;
	createdAt: string;
	isDeleted: boolean | null;
	likeCount: number;
	userState?: {
		liked: boolean;
	};
}

export interface Bookmark {
	id: number;
	post: Post;
	createdAt: string;
}

export interface FollowDto {
	id: number;
	follower: User;
	following: User;
	createdAt: string;
}

export interface FollowCounts {
	followingCount: number;
	followerCount: number;
}

export interface FollowsPage {
	content: FollowDto[];
	totalElements: number;
	totalPages: number;
	number: number;
	last: boolean;
}
