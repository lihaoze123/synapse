import { describe, expect, it, vi } from "vitest";
import api from "./api";
import { likesService } from "./likes";

vi.mock("./api");

const mockApi = vi.mocked(api, { deep: true });

describe("likesService", () => {
	describe("togglePost", () => {
		it("should like a post", async () => {
			const response = { liked: true, count: 5 };
			mockApi.post.mockResolvedValue({
				data: { success: true, data: response },
			});

			const result = await likesService.togglePost(1);

			expect(result).toEqual(response);
			expect(mockApi.post).toHaveBeenCalledWith("/likes/posts/1");
		});

		it("should unlike a post", async () => {
			const response = { liked: false, count: 4 };
			mockApi.post.mockResolvedValue({
				data: { success: true, data: response },
			});

			const result = await likesService.togglePost(1);

			expect(result).toEqual(response);
			expect(mockApi.post).toHaveBeenCalledWith("/likes/posts/1");
		});

		it("should throw error on failed toggle", async () => {
			mockApi.post.mockResolvedValue({
				data: { success: false, message: "Post not found" },
			});

			await expect(likesService.togglePost(999)).rejects.toThrow(
				"Post not found",
			);
		});
	});

	describe("toggleComment", () => {
		it("should like a comment", async () => {
			const response = { liked: true, count: 3 };
			mockApi.post.mockResolvedValue({
				data: { success: true, data: response },
			});

			const result = await likesService.toggleComment(1);

			expect(result).toEqual(response);
			expect(mockApi.post).toHaveBeenCalledWith("/comment-likes/1");
		});

		it("should unlike a comment", async () => {
			const response = { liked: false, count: 2 };
			mockApi.post.mockResolvedValue({
				data: { success: true, data: response },
			});

			const result = await likesService.toggleComment(1);

			expect(result).toEqual(response);
			expect(mockApi.post).toHaveBeenCalledWith("/comment-likes/1");
		});

		it("should throw error on failed toggle", async () => {
			mockApi.post.mockResolvedValue({
				data: { success: false, message: "Comment not found" },
			});

			await expect(likesService.toggleComment(999)).rejects.toThrow(
				"Comment not found",
			);
		});
	});
});
