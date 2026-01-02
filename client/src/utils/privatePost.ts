import type { Post } from "@/types";

const STORAGE_KEY = "unlockedPosts";

export function getUnlockedPost(postId: number): Post | null {
	try {
		const data = sessionStorage.getItem(STORAGE_KEY);
		if (!data) return null;
		const posts = JSON.parse(data) as Record<string, Post>;
		return posts[String(postId)] || null;
	} catch {
		return null;
	}
}

export function setUnlockedPost(post: Post): void {
	try {
		const data = sessionStorage.getItem(STORAGE_KEY);
		const posts = data ? (JSON.parse(data) as Record<string, Post>) : {};
		posts[String(post.id)] = post;
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
	} catch {
		// Ignore storage errors
	}
}

export function isPostUnlocked(postId: number): boolean {
	return getUnlockedPost(postId) !== null;
}
