import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
	type CreateCommentRequest,
	type UpdateCommentRequest,
	commentsService,
} from "../services/comments";
import {
	useCreateComment,
	useDeleteComment,
	usePostComments,
	useUpdateComment,
} from "./useComments";

vi.mock("../services/comments");

const mockCommentsService = vi.mocked(commentsService);

describe("useComments hook", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
		vi.clearAllMocks();
	});

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	describe("usePostComments", () => {
		it("should fetch comments for a post", async () => {
			const mockPage = {
				content: [
					{
						id: 1,
						content: "Test comment",
						user: { id: 1, username: "user", avatarUrl: null },
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
			mockCommentsService.getPostComments.mockResolvedValue(mockPage);

			const { result } = renderHook(() => usePostComments(1), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data?.pages[0]).toEqual(mockPage);
			expect(mockCommentsService.getPostComments).toHaveBeenCalledWith(
				1,
				0,
				20,
			);
		});

		it("should not fetch when postId is 0", () => {
			renderHook(() => usePostComments(0), { wrapper });

			expect(mockCommentsService.getPostComments).not.toHaveBeenCalled();
		});

		it("should not fetch when disabled", () => {
			renderHook(() => usePostComments(1, false), { wrapper });

			expect(mockCommentsService.getPostComments).not.toHaveBeenCalled();
		});
	});

	describe("useCreateComment", () => {
		it("should create comment and update cache", async () => {
			const newComment = {
				id: 1,
				content: "New comment",
				user: { id: 1, username: "user", avatarUrl: null },
				postId: 1,
				parentId: null,
				createdAt: "2024-01-01T00:00:00",
				isDeleted: null,
				likeCount: 0,
			};
			mockCommentsService.createComment.mockResolvedValue(newComment);

			const { result } = renderHook(() => useCreateComment(), { wrapper });

			await result.current.mutateAsync({
				postId: 1,
				data: { content: "New comment" },
			});

			expect(mockCommentsService.createComment).toHaveBeenCalledWith(1, {
				content: "New comment",
			});
		});

		it("should create reply to comment", async () => {
			const reply = {
				id: 2,
				content: "Reply",
				user: { id: 1, username: "user", avatarUrl: null },
				postId: 1,
				parentId: 1,
				createdAt: "2024-01-01T00:00:00",
				isDeleted: null,
				likeCount: 0,
			};
			mockCommentsService.createComment.mockResolvedValue(reply);

			const { result } = renderHook(() => useCreateComment(), { wrapper });

			await result.current.mutateAsync({
				postId: 1,
				data: { content: "Reply", parentId: 1 },
			});

			expect(mockCommentsService.createComment).toHaveBeenCalledWith(1, {
				content: "Reply",
				parentId: 1,
			});
		});

		it("should add comment to existing cache", async () => {
			const existingComment = {
				id: 1,
				content: "Existing comment",
				user: { id: 1, username: "user", avatarUrl: null },
				postId: 1,
				parentId: null,
				createdAt: "2024-01-01T00:00:00",
				isDeleted: null,
				likeCount: 0,
			};

			// Set up initial cache with a page of comments
			queryClient.setQueryData(["comments", 1], {
				pages: [
					{
						content: [existingComment],
						totalElements: 1,
						totalPages: 1,
						number: 0,
						size: 20,
						first: true,
						last: true,
					},
				],
				pageParams: [0],
			});

			const newComment = {
				id: 2,
				content: "New comment",
				user: { id: 1, username: "user", avatarUrl: null },
				postId: 1,
				parentId: null,
				createdAt: "2024-01-01T00:00:00",
				isDeleted: null,
				likeCount: 0,
			};
			mockCommentsService.createComment.mockResolvedValue(newComment);

			const { result } = renderHook(() => useCreateComment(), { wrapper });

			await result.current.mutateAsync({
				postId: 1,
				data: { content: "New comment" },
			});

			const cacheData = queryClient.getQueryData(["comments", 1]) as any;
			expect(cacheData.pages[0].content).toHaveLength(2);
			expect(cacheData.pages[0].content[1].id).toBe(2);
		});
	});

	describe("useUpdateComment", () => {
		it("should update comment with optimistic update", async () => {
			const updatedComment = {
				id: 1,
				content: "Updated content",
				user: { id: 1, username: "user", avatarUrl: null },
				postId: 1,
				parentId: null,
				createdAt: "2024-01-01T00:00:00",
				isDeleted: null,
				likeCount: 0,
			};
			mockCommentsService.updateComment.mockResolvedValue(updatedComment);

			const { result } = renderHook(() => useUpdateComment(), { wrapper });

			await result.current.mutateAsync({
				id: 1,
				data: { content: "Updated content" },
			});

			expect(mockCommentsService.updateComment).toHaveBeenCalledWith(1, {
				content: "Updated content",
			});
		});

		it("should rollback on error", async () => {
			mockCommentsService.updateComment.mockRejectedValue(
				new Error("Update failed"),
			);

			const { result } = renderHook(() => useUpdateComment(), { wrapper });

			await expect(
				result.current.mutateAsync({
					id: 1,
					data: { content: "Updated" },
				}),
			).rejects.toThrow("Update failed");

			expect(result.current.error).toBeDefined();
		});

		it("should optimistically update cached comment", async () => {
			const existingComment = {
				id: 1,
				content: "Original content",
				user: { id: 1, username: "user", avatarUrl: null },
				postId: 1,
				parentId: null,
				createdAt: "2024-01-01T00:00:00",
				isDeleted: null,
				likeCount: 0,
			};

			// Set up initial cache
			queryClient.setQueryData(["comments", 1], {
				pages: [
					{
						content: [existingComment],
						totalElements: 1,
						totalPages: 1,
						number: 0,
						size: 20,
						first: true,
						last: true,
					},
				],
				pageParams: [0],
			});

			const updatedComment = {
				...existingComment,
				content: "Updated content",
			};
			mockCommentsService.updateComment.mockResolvedValue(updatedComment);

			const { result } = renderHook(() => useUpdateComment(), { wrapper });

			await result.current.mutateAsync({
				id: 1,
				data: { content: "Updated content" },
			});

			const cacheData = queryClient.getQueryData(["comments", 1]) as any;
			expect(cacheData.pages[0].content[0].content).toBe("Updated content");
		});

		it("should rollback cache on update error", async () => {
			const existingComment = {
				id: 1,
				content: "Original content",
				user: { id: 1, username: "user", avatarUrl: null },
				postId: 1,
				parentId: null,
				createdAt: "2024-01-01T00:00:00",
				isDeleted: null,
				likeCount: 0,
			};

			// Set up initial cache
			queryClient.setQueryData(["comments", 1], {
				pages: [
					{
						content: [existingComment],
						totalElements: 1,
						totalPages: 1,
						number: 0,
						size: 20,
						first: true,
						last: true,
					},
				],
				pageParams: [0],
			});

			mockCommentsService.updateComment.mockRejectedValue(
				new Error("Update failed"),
			);

			const { result } = renderHook(() => useUpdateComment(), { wrapper });

			try {
				await result.current.mutateAsync({
					id: 1,
					data: { content: "Updated content" },
				});
			} catch {
				// Expected to fail
			}

			// Wait for rollback
			await waitFor(() => {
				const cacheData = queryClient.getQueryData(["comments", 1]) as any;
				expect(cacheData.pages[0].content[0].content).toBe("Original content");
			});
		});
	});

	describe("useDeleteComment", () => {
		it("should delete comment with optimistic update", async () => {
			mockCommentsService.deleteComment.mockResolvedValue(undefined);

			const { result } = renderHook(() => useDeleteComment(), { wrapper });

			await result.current.mutateAsync({ id: 1, postId: 1 });

			expect(mockCommentsService.deleteComment).toHaveBeenCalledWith(1);
		});

		it("should rollback on error", async () => {
			mockCommentsService.deleteComment.mockRejectedValue(
				new Error("Delete failed"),
			);

			const { result } = renderHook(() => useDeleteComment(), { wrapper });

			await expect(
				result.current.mutateAsync({ id: 1, postId: 1 }),
			).rejects.toThrow("Delete failed");
		});

		it("should optimistically mark comment as deleted", async () => {
			const existingComment = {
				id: 1,
				content: "To be deleted",
				user: { id: 1, username: "user", avatarUrl: null },
				postId: 1,
				parentId: null,
				createdAt: "2024-01-01T00:00:00",
				isDeleted: null,
				likeCount: 0,
			};

			// Set up initial cache
			queryClient.setQueryData(["comments", 1], {
				pages: [
					{
						content: [existingComment],
						totalElements: 1,
						totalPages: 1,
						number: 0,
						size: 20,
						first: true,
						last: true,
					},
				],
				pageParams: [0],
			});

			mockCommentsService.deleteComment.mockResolvedValue(undefined);

			const { result } = renderHook(() => useDeleteComment(), { wrapper });

			await result.current.mutateAsync({ id: 1, postId: 1 });

			const cacheData = queryClient.getQueryData(["comments", 1]) as any;
			expect(cacheData.pages[0].content[0].isDeleted).toBe(true);
			expect(cacheData.pages[0].content[0].content).toBe("该评论已删除");
		});

		it("should rollback cache on delete error", async () => {
			const existingComment = {
				id: 1,
				content: "Original content",
				user: { id: 1, username: "user", avatarUrl: null },
				postId: 1,
				parentId: null,
				createdAt: "2024-01-01T00:00:00",
				isDeleted: null,
				likeCount: 0,
			};

			// Set up initial cache
			queryClient.setQueryData(["comments", 1], {
				pages: [
					{
						content: [existingComment],
						totalElements: 1,
						totalPages: 1,
						number: 0,
						size: 20,
						first: true,
						last: true,
					},
				],
				pageParams: [0],
			});

			mockCommentsService.deleteComment.mockRejectedValue(
				new Error("Delete failed"),
			);

			const { result } = renderHook(() => useDeleteComment(), { wrapper });

			try {
				await result.current.mutateAsync({ id: 1, postId: 1 });
			} catch {
				// Expected to fail
			}

			// Wait for rollback
			await waitFor(() => {
				const cacheData = queryClient.getQueryData(["comments", 1]) as any;
				expect(cacheData.pages[0].content[0].content).toBe("Original content");
				expect(cacheData.pages[0].content[0].isDeleted).toBeNull();
			});
		});
	});
});
