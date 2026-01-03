import { describe, expect, it } from "vitest";
import type { Post } from "@/types";
import {
	getUnlockedPost,
	isPostUnlocked,
	setUnlockedPost,
} from "./privatePost";

describe("privatePost", () => {
	const mockPost: Post = {
		id: 1,
		type: "SNIPPET",
		title: "Test Post",
		content: 'console.log("test")',
		language: "javascript",
		summary: null,
		coverImage: null,
		isPrivate: true,
		password: "secret",
		createdAt: "2024-01-01T00:00:00Z",
		user: {
			id: 1,
			username: "testuser",
			avatarUrl: null,
		},
		tags: [],
		likesCount: 0,
		commentsCount: 0,
		isLiked: false,
		isBookmarked: false,
	};

	describe("setUnlockedPost and getUnlockedPost", () => {
		it("should save and retrieve unlocked post", () => {
			setUnlockedPost(mockPost);
			const retrieved = getUnlockedPost(1);

			expect(retrieved).toEqual(mockPost);
		});

		it("should return null for non-existent post", () => {
			const retrieved = getUnlockedPost(999);
			expect(retrieved).toBeNull();
		});

		it("should handle multiple unlocked posts", () => {
			const post2: Post = { ...mockPost, id: 2, title: "Post 2" };
			const post3: Post = { ...mockPost, id: 3, title: "Post 3" };

			setUnlockedPost(mockPost);
			setUnlockedPost(post2);
			setUnlockedPost(post3);

			expect(getUnlockedPost(1)).toEqual(mockPost);
			expect(getUnlockedPost(2)).toEqual(post2);
			expect(getUnlockedPost(3)).toEqual(post3);
		});

		it("should overwrite existing post with same id", () => {
			setUnlockedPost(mockPost);
			const updatedPost: Post = { ...mockPost, title: "Updated Title" };

			setUnlockedPost(updatedPost);
			const retrieved = getUnlockedPost(1);

			expect(retrieved?.title).toBe("Updated Title");
		});

		it("should handle corrupted storage data", () => {
			sessionStorage.setItem("unlockedPosts", "invalid json");
			const retrieved = getUnlockedPost(1);
			expect(retrieved).toBeNull();
		});
	});

	describe("isPostUnlocked", () => {
		it("should return true when post is unlocked", () => {
			setUnlockedPost(mockPost);
			expect(isPostUnlocked(1)).toBe(true);
		});

		it("should return false when post is not unlocked", () => {
			expect(isPostUnlocked(1)).toBe(false);
		});

		it("should return false for different post id", () => {
			setUnlockedPost(mockPost);
			expect(isPostUnlocked(2)).toBe(false);
		});

		it("should return false for corrupted storage", () => {
			sessionStorage.setItem("unlockedPosts", "invalid");
			expect(isPostUnlocked(1)).toBe(false);
		});
	});
});
