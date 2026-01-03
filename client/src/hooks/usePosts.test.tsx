import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { postsService } from "../services/posts";
import {
	useCreatePost,
	useDeletePost,
	usePost,
	usePosts,
	useUpdatePost,
} from "./usePosts";

vi.mock("../services/posts");

const mockPostsService = vi.mocked(postsService);

describe("usePosts hook", () => {
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

	describe("usePosts", () => {
		it("should fetch posts with infinite scroll", async () => {
			const mockPage = {
				content: [{ id: 1, title: "Post 1" }],
				totalElements: 25,
				totalPages: 3,
				number: 0,
				size: 10,
				first: true,
				last: false,
			};
			mockPostsService.getPosts.mockResolvedValue(mockPage);

			const { result } = renderHook(() => usePosts(), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data?.pages[0]).toEqual(mockPage);
			await waitFor(() => {
				expect(mockPostsService.getPosts).toHaveBeenCalled();
				const callArgs = mockPostsService.getPosts.mock.calls[0][0];
				expect(callArgs).toHaveProperty("page", 0);
			});
		});

		it("should fetch posts with tag filter", async () => {
			mockPostsService.getPosts.mockResolvedValue({
				content: [],
				totalElements: 0,
				totalPages: 0,
				number: 0,
				size: 10,
				first: true,
				last: true,
			});

			renderHook(() => usePosts({ tag: "react" }), { wrapper });

			await waitFor(() => {
				expect(mockPostsService.getPosts).toHaveBeenCalled();
				const callArgs = mockPostsService.getPosts.mock.calls[0][0];
				expect(callArgs).toHaveProperty("tag", "react");
				expect(callArgs).toHaveProperty("page", 0);
			});
		});

		it("should fetch posts with type filter", async () => {
			mockPostsService.getPosts.mockResolvedValue({
				content: [],
				totalElements: 0,
				totalPages: 0,
				number: 0,
				size: 10,
				first: true,
				last: true,
			});

			renderHook(() => usePosts({ type: "SNIPPET" }), { wrapper });

			await waitFor(() => {
				expect(mockPostsService.getPosts).toHaveBeenCalled();
				const callArgs = mockPostsService.getPosts.mock.calls[0][0];
				expect(callArgs).toHaveProperty("type", "SNIPPET");
				expect(callArgs).toHaveProperty("page", 0);
			});
		});

		it("should determine next page param correctly", async () => {
			const firstPage = {
				content: [{ id: 1 }],
				totalElements: 25,
				totalPages: 3,
				number: 0,
				size: 10,
				first: true,
				last: false,
			};
			mockPostsService.getPosts.mockResolvedValue(firstPage);

			const { result } = renderHook(() => usePosts(), { wrapper });

			await waitFor(() => expect(result.current.hasNextPage).toBe(true));
		});

		it("should not have next page on last page", async () => {
			const lastPage = {
				content: [{ id: 1 }],
				totalElements: 5,
				totalPages: 1,
				number: 0,
				size: 10,
				first: true,
				last: true,
			};
			mockPostsService.getPosts.mockResolvedValue(lastPage);

			const { result } = renderHook(() => usePosts(), { wrapper });

			await waitFor(() => expect(result.current.hasNextPage).toBe(false));
		});
	});

	describe("usePost", () => {
		it("should fetch single post by id", async () => {
			const mockPost = {
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
			};
			mockPostsService.getPost.mockResolvedValue(mockPost);

			const { result } = renderHook(() => usePost(1), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockPost);
			expect(mockPostsService.getPost).toHaveBeenCalledWith(1);
		});

		it("should not fetch when id is 0", () => {
			renderHook(() => usePost(0), { wrapper });

			expect(mockPostsService.getPost).not.toHaveBeenCalled();
		});

		it("should not fetch when id is negative", () => {
			renderHook(() => usePost(-1), { wrapper });

			expect(mockPostsService.getPost).not.toHaveBeenCalled();
		});
	});

	describe("useCreatePost", () => {
		it("should create post and invalidate queries", async () => {
			const newPost = {
				id: 1,
				type: "ARTICLE" as const,
				title: "New Post",
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
			};
			mockPostsService.createPost.mockResolvedValue(newPost);

			const { result } = renderHook(() => useCreatePost(), { wrapper });

			await result.current.mutateAsync({
				type: "ARTICLE",
				title: "New Post",
				content: "Content",
			});

			expect(mockPostsService.createPost).toHaveBeenCalled();
		});

		it("should handle creation error", async () => {
			mockPostsService.createPost.mockRejectedValue(
				new Error("Creation failed"),
			);

			const { result } = renderHook(() => useCreatePost(), { wrapper });

			await expect(
				result.current.mutateAsync({
					type: "ARTICLE",
					content: "",
				}),
			).rejects.toThrow("Creation failed");

			expect(result.current.error).toBeDefined();
		});
	});

	describe("useUpdatePost", () => {
		it("should update post and invalidate queries", async () => {
			const updatedPost = {
				id: 1,
				type: "ARTICLE" as const,
				title: "Updated",
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
			};
			mockPostsService.updatePost.mockResolvedValue(updatedPost);

			const { result } = renderHook(() => useUpdatePost(), { wrapper });

			await result.current.mutateAsync({
				id: 1,
				data: { type: "ARTICLE", title: "Updated", content: "Content" },
			});

			expect(mockPostsService.updatePost).toHaveBeenCalledWith(1, {
				type: "ARTICLE",
				title: "Updated",
				content: "Content",
			});
		});

		it("should handle update error", async () => {
			mockPostsService.updatePost.mockRejectedValue(new Error("Update failed"));

			const { result } = renderHook(() => useUpdatePost(), { wrapper });

			await expect(
				result.current.mutateAsync({
					id: 1,
					data: { type: "ARTICLE", content: "test" },
				}),
			).rejects.toThrow("Update failed");
		});
	});

	describe("useDeletePost", () => {
		it("should delete post and invalidate queries", async () => {
			mockPostsService.deletePost.mockResolvedValue(undefined);

			const { result } = renderHook(() => useDeletePost(), { wrapper });

			await result.current.mutateAsync(1);

			expect(mockPostsService.deletePost).toHaveBeenCalledWith(1);
		});

		it("should handle delete error", async () => {
			mockPostsService.deletePost.mockRejectedValue(new Error("Delete failed"));

			const { result } = renderHook(() => useDeletePost(), { wrapper });

			await expect(result.current.mutateAsync(1)).rejects.toThrow(
				"Delete failed",
			);
		});
	});
});
