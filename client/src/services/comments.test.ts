import { describe, expect, it, vi } from "vitest";
import api from "./api";
import { commentsService } from "./comments";

vi.mock("./api");

const mockApi = vi.mocked(api, { deep: true });

describe("commentsService", () => {
	describe("getPostComments", () => {
		it("should fetch comments for a post", async () => {
			const mockPage = {
				content: [
					{
						id: 1,
						content: "Great post!",
						user: { id: 1, username: "user1", avatarUrl: null },
						postId: 1,
						parentId: null,
						createdAt: "2024-01-01T00:00:00",
						isDeleted: null,
						likeCount: 0,
					},
				],
				totalElements: 1,
				totalPages: 1,
				number: 0,
				size: 20,
				first: true,
				last: true,
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockPage },
			});

			const result = await commentsService.getPostComments(1);

			expect(result).toEqual(mockPage);
			expect(mockApi.get).toHaveBeenCalledWith(
				"/posts/1/comments?page=0&size=20",
			);
		});

		it("should fetch comments with custom pagination", async () => {
			const mockPage = {
				content: [],
				totalElements: 25,
				totalPages: 2,
				number: 1,
				size: 15,
				first: false,
				last: true,
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockPage },
			});

			await commentsService.getPostComments(1, 1, 15);

			expect(mockApi.get).toHaveBeenCalledWith(
				"/posts/1/comments?page=1&size=15",
			);
		});

		it("should throw error on failed fetch", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "Post not found" },
			});

			await expect(commentsService.getPostComments(999)).rejects.toThrow(
				"Post not found",
			);
		});
	});

	describe("getComment", () => {
		it("should fetch single comment by id", async () => {
			const mockComment = {
				id: 1,
				content: "Test comment",
				user: { id: 1, username: "user1", avatarUrl: null },
				postId: 1,
				parentId: null,
				createdAt: "2024-01-01T00:00:00",
				isDeleted: null,
				likeCount: 0,
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockComment },
			});

			const result = await commentsService.getComment(1);

			expect(result).toEqual(mockComment);
			expect(mockApi.get).toHaveBeenCalledWith("/comments/1");
		});

		it("should throw error on fetch failure", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "Comment not found" },
			});

			await expect(commentsService.getComment(999)).rejects.toThrow(
				"Comment not found",
			);
		});
	});

	describe("createComment", () => {
		it("should create a top-level comment", async () => {
			const newComment = {
				id: 1,
				content: "New comment",
				user: { id: 1, username: "user1", avatarUrl: null },
				postId: 1,
				parentId: null,
				createdAt: "2024-01-01T00:00:00",
				isDeleted: null,
				likeCount: 0,
			};
			mockApi.post.mockResolvedValue({
				data: { success: true, data: newComment },
			});

			const result = await commentsService.createComment(1, {
				content: "New comment",
			});

			expect(result).toEqual(newComment);
			expect(mockApi.post).toHaveBeenCalledWith("/posts/1/comments", {
				content: "New comment",
			});
		});

		it("should create a reply to a comment", async () => {
			const reply = {
				id: 2,
				content: "Reply to comment",
				user: { id: 1, username: "user1", avatarUrl: null },
				postId: 1,
				parentId: 1,
				createdAt: "2024-01-01T00:00:00",
				isDeleted: null,
				likeCount: 0,
			};
			mockApi.post.mockResolvedValue({
				data: { success: true, data: reply },
			});

			const result = await commentsService.createComment(1, {
				content: "Reply to comment",
				parentId: 1,
			});

			expect(result).toEqual(reply);
			expect(mockApi.post).toHaveBeenCalledWith("/posts/1/comments", {
				content: "Reply to comment",
				parentId: 1,
			});
		});

		it("should throw error on failed creation", async () => {
			mockApi.post.mockResolvedValue({
				data: { success: false, message: "Content cannot be empty" },
			});

			await expect(
				commentsService.createComment(1, { content: "" }),
			).rejects.toThrow("Content cannot be empty");
		});
	});

	describe("updateComment", () => {
		it("should update existing comment", async () => {
			const updatedComment = {
				id: 1,
				content: "Updated comment",
				user: { id: 1, username: "user1", avatarUrl: null },
				postId: 1,
				parentId: null,
				createdAt: "2024-01-01T00:00:00",
				isDeleted: null,
				likeCount: 0,
			};
			mockApi.put.mockResolvedValue({
				data: { success: true, data: updatedComment },
			});

			const result = await commentsService.updateComment(1, {
				content: "Updated comment",
			});

			expect(result).toEqual(updatedComment);
			expect(mockApi.put).toHaveBeenCalledWith("/comments/1", {
				content: "Updated comment",
			});
		});

		it("should throw error on failed update", async () => {
			mockApi.put.mockResolvedValue({
				data: { success: false, message: "Not authorized" },
			});

			await expect(
				commentsService.updateComment(1, { content: "test" }),
			).rejects.toThrow("Not authorized");
		});
	});

	describe("deleteComment", () => {
		it("should delete comment", async () => {
			mockApi.delete.mockResolvedValue({
				data: { success: true },
			});

			await commentsService.deleteComment(1);

			expect(mockApi.delete).toHaveBeenCalledWith("/comments/1");
		});

		it("should throw error on failed deletion", async () => {
			mockApi.delete.mockResolvedValue({
				data: { success: false, message: "Not authorized" },
			});

			await expect(commentsService.deleteComment(1)).rejects.toThrow(
				"Not authorized",
			);
		});
	});
});
