import { describe, expect, it, vi } from "vitest";
import api from "./api";
import { bookmarksService } from "./bookmarks";

vi.mock("./api");

const mockApi = vi.mocked(api);

describe("bookmarksService", () => {
	describe("getCount", () => {
		it("should fetch bookmark count for a post", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: true, data: 5 },
			});

			const result = await bookmarksService.getCount(1);

			expect(result).toBe(5);
			expect(mockApi.get).toHaveBeenCalledWith("/bookmarks/posts/1/count");
		});

		it("should throw error on failed fetch", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "Post not found" },
			});

			await expect(bookmarksService.getCount(999)).rejects.toThrow(
				"Post not found",
			);
		});
	});

	describe("check", () => {
		it("should return true when post is bookmarked", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: true, data: true },
			});

			const result = await bookmarksService.check(1);

			expect(result).toBe(true);
			expect(mockApi.get).toHaveBeenCalledWith("/bookmarks/posts/1");
		});

		it("should return false when post is not bookmarked", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: true, data: false },
			});

			const result = await bookmarksService.check(1);

			expect(result).toBe(false);
		});

		it("should throw error on failed check", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "Unauthorized" },
			});

			await expect(bookmarksService.check(1)).rejects.toThrow("Unauthorized");
		});
	});

	describe("add", () => {
		it("should add bookmark", async () => {
			const mockBookmark = {
				id: 1,
				post: {
					id: 1,
					type: "ARTICLE" as const,
					title: "Test Post",
					content: "Content",
					language: null,
					summary: null,
					coverImage: null,
					images: null,
					attachments: null,
					user: { id: 1, username: "user", avatarUrl: null },
					tags: [],
					createdAt: "2024-01-01T00:00:00",
					likeCount: 0,
					isPrivate: false,
				},
				createdAt: "2024-01-01T00:00:00",
			};
			mockApi.post.mockResolvedValue({
				data: { success: true, data: mockBookmark },
			});

			const result = await bookmarksService.add(1);

			expect(result).toEqual(mockBookmark);
			expect(mockApi.post).toHaveBeenCalledWith("/bookmarks/posts/1");
		});

		it("should throw error on failed add", async () => {
			mockApi.post.mockResolvedValue({
				data: { success: false, message: "Already bookmarked" },
			});

			await expect(bookmarksService.add(1)).rejects.toThrow(
				"Already bookmarked",
			);
		});
	});

	describe("remove", () => {
		it("should remove bookmark", async () => {
			mockApi.delete.mockResolvedValue({
				data: { success: true },
			});

			await bookmarksService.remove(1);

			expect(mockApi.delete).toHaveBeenCalledWith("/bookmarks/posts/1");
		});

		it("should throw error on failed removal", async () => {
			mockApi.delete.mockResolvedValue({
				data: { success: false, message: "Not bookmarked" },
			});

			await expect(bookmarksService.remove(1)).rejects.toThrow(
				"Not bookmarked",
			);
		});
	});

	describe("list", () => {
		it("should fetch bookmarks list with default params", async () => {
			const mockPage = {
				content: [
					{
						id: 1,
						post: {
							id: 1,
							type: "ARTICLE" as const,
							title: "Test Post",
							content: "Content",
							language: null,
							summary: null,
							coverImage: null,
							images: null,
							attachments: null,
							user: { id: 1, username: "user", avatarUrl: null },
							tags: [],
							createdAt: "2024-01-01T00:00:00",
							likeCount: 0,
							isPrivate: false,
						},
						createdAt: "2024-01-01T00:00:00",
					},
				],
				totalElements: 1,
				totalPages: 1,
				number: 0,
				last: true,
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockPage },
			});

			const result = await bookmarksService.list();

			expect(result).toEqual(mockPage);
			expect(mockApi.get).toHaveBeenCalledWith("/bookmarks?page=0&size=10");
		});

		it("should fetch bookmarks with pagination", async () => {
			const mockPage = {
				content: [],
				totalElements: 25,
				totalPages: 3,
				number: 1,
				last: false,
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockPage },
			});

			await bookmarksService.list({ page: 1, size: 10 });

			expect(mockApi.get).toHaveBeenCalledWith("/bookmarks?page=1&size=10");
		});

		it("should throw error on failed fetch", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "Unauthorized" },
			});

			await expect(bookmarksService.list()).rejects.toThrow("Unauthorized");
		});
	});
});
