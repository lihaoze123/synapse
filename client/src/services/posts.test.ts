import { describe, expect, it, vi } from "vitest";
import api from "./api";
import { postsService } from "./posts";

vi.mock("./api");

const mockApi = vi.mocked(api, { deep: true });

describe("postsService", () => {
	describe("getPosts", () => {
		it("should fetch posts with default params", async () => {
			const mockPage = {
				content: [{ id: 1, title: "Test Post" }],
				totalElements: 1,
				totalPages: 1,
				number: 0,
				size: 10,
				first: true,
				last: true,
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockPage },
			});

			const result = await postsService.getPosts();

			expect(result).toEqual(mockPage);
			expect(mockApi.get).toHaveBeenCalledWith("/posts?page=0&size=10");
		});

		it("should fetch posts with tag filter", async () => {
			const mockPage = {
				content: [{ id: 1, title: "Test Post" }],
				totalElements: 1,
				totalPages: 1,
				number: 0,
				size: 10,
				first: true,
				last: true,
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockPage },
			});

			await postsService.getPosts({ tag: "react" });

			expect(mockApi.get).toHaveBeenCalledWith(
				"/posts?tag=react&page=0&size=10",
			);
		});

		it("should fetch posts with type filter", async () => {
			const mockPage = {
				content: [{ id: 1, title: "Test Post", type: "SNIPPET" }],
				totalElements: 1,
				totalPages: 1,
				number: 0,
				size: 10,
				first: true,
				last: true,
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockPage },
			});

			await postsService.getPosts({ type: "SNIPPET" });

			expect(mockApi.get).toHaveBeenCalledWith(
				"/posts?type=SNIPPET&page=0&size=10",
			);
		});

		it("should fetch posts with pagination", async () => {
			const mockPage = {
				content: [{ id: 2, title: "Page 2" }],
				totalElements: 25,
				totalPages: 3,
				number: 1,
				size: 10,
				first: false,
				last: false,
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockPage },
			});

			await postsService.getPosts({ page: 1, size: 10 });

			expect(mockApi.get).toHaveBeenCalledWith("/posts?page=1&size=10");
		});

		it("should throw error on failed fetch", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "Network error" },
			});

			await expect(postsService.getPosts()).rejects.toThrow("Network error");
		});
	});

	describe("getPost", () => {
		it("should fetch single post by id", async () => {
			const mockPost = {
				id: 1,
				title: "Test Post",
				content: "Test content",
				user: { id: 1, username: "test", avatarUrl: null },
				tags: [],
				createdAt: "2024-01-01T00:00:00",
				likeCount: 0,
				isPrivate: false,
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockPost },
			});

			const result = await postsService.getPost(1);

			expect(result).toEqual(mockPost);
			expect(mockApi.get).toHaveBeenCalledWith("/posts/1");
		});

		it("should throw error on fetch failure", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "Post not found" },
			});

			await expect(postsService.getPost(999)).rejects.toThrow("Post not found");
		});
	});

	describe("createPost", () => {
		it("should create a new post", async () => {
			const newPost = {
				id: 1,
				title: "New Post",
				content: "New content",
				type: "ARTICLE" as const,
				user: { id: 1, username: "test", avatarUrl: null },
				tags: [],
				createdAt: "2024-01-01T00:00:00",
				likeCount: 0,
				isPrivate: false,
			};
			mockApi.post.mockResolvedValue({
				data: { success: true, data: newPost },
			});

			const result = await postsService.createPost({
				type: "ARTICLE",
				title: "New Post",
				content: "New content",
			});

			expect(result).toEqual(newPost);
			expect(mockApi.post).toHaveBeenCalledWith("/posts", {
				type: "ARTICLE",
				title: "New Post",
				content: "New content",
			});
		});

		it("should create a snippet with language", async () => {
			const snippet = {
				id: 1,
				title: null,
				content: "console.log('hello')",
				language: "javascript",
				type: "SNIPPET" as const,
				user: { id: 1, username: "test", avatarUrl: null },
				tags: [],
				createdAt: "2024-01-01T00:00:00",
				likeCount: 0,
				isPrivate: false,
			};
			mockApi.post.mockResolvedValue({
				data: { success: true, data: snippet },
			});

			const result = await postsService.createPost({
				type: "SNIPPET",
				content: "console.log('hello')",
				language: "javascript",
			});

			expect(result).toEqual(snippet);
			expect(mockApi.post).toHaveBeenCalledWith("/posts", {
				type: "SNIPPET",
				content: "console.log('hello')",
				language: "javascript",
			});
		});

		it("should create a private post with password", async () => {
			const privatePost = {
				id: 1,
				title: "Private Post",
				content: "Secret content",
				type: "ARTICLE" as const,
				isPrivate: true,
				password: "secret123",
				user: { id: 1, username: "test", avatarUrl: null },
				tags: [],
				createdAt: "2024-01-01T00:00:00",
				likeCount: 0,
			};
			mockApi.post.mockResolvedValue({
				data: { success: true, data: privatePost },
			});

			const result = await postsService.createPost({
				type: "ARTICLE",
				title: "Private Post",
				content: "Secret content",
				isPrivate: true,
				password: "secret123",
			});

			expect(result.isPrivate).toBe(true);
			expect(mockApi.post).toHaveBeenCalledWith("/posts", {
				type: "ARTICLE",
				title: "Private Post",
				content: "Secret content",
				isPrivate: true,
				password: "secret123",
			});
		});

		it("should throw error on failed creation", async () => {
			mockApi.post.mockResolvedValue({
				data: { success: false, message: "Validation failed" },
			});

			await expect(
				postsService.createPost({ type: "ARTICLE", content: "" }),
			).rejects.toThrow("Validation failed");
		});
	});

	describe("updatePost", () => {
		it("should update existing post", async () => {
			const updatedPost = {
				id: 1,
				title: "Updated Title",
				content: "Updated content",
				type: "ARTICLE" as const,
				user: { id: 1, username: "test", avatarUrl: null },
				tags: [],
				createdAt: "2024-01-01T00:00:00",
				likeCount: 0,
				isPrivate: false,
			};
			mockApi.put.mockResolvedValue({
				data: { success: true, data: updatedPost },
			});

			const result = await postsService.updatePost(1, {
				type: "ARTICLE",
				title: "Updated Title",
				content: "Updated content",
			});

			expect(result).toEqual(updatedPost);
			expect(mockApi.put).toHaveBeenCalledWith("/posts/1", {
				type: "ARTICLE",
				title: "Updated Title",
				content: "Updated content",
			});
		});

		it("should throw error on failed update", async () => {
			mockApi.put.mockResolvedValue({
				data: { success: false, message: "Not authorized" },
			});

			await expect(
				postsService.updatePost(1, { type: "ARTICLE", content: "test" }),
			).rejects.toThrow("Not authorized");
		});
	});

	describe("deletePost", () => {
		it("should delete post", async () => {
			mockApi.delete.mockResolvedValue({
				data: { success: true },
			});

			await postsService.deletePost(1);

			expect(mockApi.delete).toHaveBeenCalledWith("/posts/1");
		});

		it("should throw error on failed deletion", async () => {
			mockApi.delete.mockResolvedValue({
				data: { success: false, message: "Not authorized" },
			});

			await expect(postsService.deletePost(1)).rejects.toThrow(
				"Not authorized",
			);
		});
	});

	describe("searchPosts", () => {
		it("should search posts by keyword", async () => {
			const mockPage = {
				content: [{ id: 1, title: "React Tutorial" }],
				totalElements: 1,
				totalPages: 1,
				number: 0,
				size: 10,
				first: true,
				last: true,
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockPage },
			});

			const result = await postsService.searchPosts({ keyword: "react" });

			expect(result).toEqual(mockPage);
			expect(mockApi.get).toHaveBeenCalledWith(
				"/posts/search?keyword=react&page=0&size=10",
			);
		});

		it("should search posts with keyword and type filter", async () => {
			const mockPage = {
				content: [{ id: 1, title: "React Snippet", type: "SNIPPET" }],
				totalElements: 1,
				totalPages: 1,
				number: 0,
				size: 10,
				first: true,
				last: true,
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockPage },
			});

			await postsService.searchPosts({ keyword: "react", type: "SNIPPET" });

			expect(mockApi.get).toHaveBeenCalledWith(
				"/posts/search?keyword=react&type=SNIPPET&page=0&size=10",
			);
		});

		it("should search posts with keyword and tag", async () => {
			mockApi.get.mockResolvedValue({
				data: {
					success: true,
					data: {
						content: [],
						totalElements: 0,
						totalPages: 0,
						number: 0,
						size: 10,
						first: true,
						last: true,
					},
				},
			});

			await postsService.searchPosts({ keyword: "test", tag: "frontend" });

			expect(mockApi.get).toHaveBeenCalledWith(
				"/posts/search?keyword=test&tag=frontend&page=0&size=10",
			);
		});

		it("should search posts with multiple tags", async () => {
			mockApi.get.mockResolvedValue({
				data: {
					success: true,
					data: {
						content: [],
						totalElements: 0,
						totalPages: 0,
						number: 0,
						size: 10,
						first: true,
						last: true,
					},
				},
			});

			await postsService.searchPosts({
				keyword: "test",
				tags: ["react", "vue"],
			});

			expect(mockApi.get).toHaveBeenCalledWith(
				"/posts/search?keyword=test&tags=react&tags=vue&page=0&size=10",
			);
		});

		it("should throw error on failed search", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "Search service unavailable" },
			});

			await expect(
				postsService.searchPosts({ keyword: "test" }),
			).rejects.toThrow("Search service unavailable");
		});
	});

	describe("verifyPostPassword", () => {
		it("should verify password for private post", async () => {
			const mockPost = {
				id: 1,
				title: "Private Post",
				content: "Secret content",
				type: "ARTICLE" as const,
				isPrivate: true,
				user: { id: 1, username: "test", avatarUrl: null },
				tags: [],
				createdAt: "2024-01-01T00:00:00",
				likeCount: 0,
			};
			mockApi.post.mockResolvedValue({
				data: { success: true, data: mockPost },
			});

			const result = await postsService.verifyPostPassword(1, "password123");

			expect(result).toEqual(mockPost);
			expect(mockApi.post).toHaveBeenCalledWith("/posts/1/verify-password", {
				password: "password123",
			});
		});

		it("should throw error on incorrect password", async () => {
			mockApi.post.mockResolvedValue({
				data: { success: false, message: "Incorrect password" },
			});

			await expect(postsService.verifyPostPassword(1, "wrong")).rejects.toThrow(
				"Incorrect password",
			);
		});
	});
});
