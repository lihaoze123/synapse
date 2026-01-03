import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { postsService } from "../services/posts";
import { useSearch } from "./useSearch";

vi.mock("../services/posts");

const mockPostsService = vi.mocked(postsService);

describe("useSearch hook", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
			},
		});
		vi.clearAllMocks();
	});

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	describe("enabled state", () => {
		it("should be enabled when keyword is provided", () => {
			mockPostsService.searchPosts.mockResolvedValue({
				content: [],
				totalElements: 0,
				totalPages: 0,
				number: 0,
				size: 10,
				first: true,
				last: true,
			});

			const { result } = renderHook(() => useSearch({ keyword: "react" }), {
				wrapper,
			});

			expect(result.current.isEnabled).toBe(true);
		});

		it("should be enabled when type is provided without keyword", () => {
			mockPostsService.searchPosts.mockResolvedValue({
				content: [],
				totalElements: 0,
				totalPages: 0,
				number: 0,
				size: 10,
				first: true,
				last: true,
			});

			const { result } = renderHook(
				() => useSearch({ keyword: "", type: "SNIPPET" }),
				{
					wrapper,
				},
			);

			expect(result.current.isEnabled).toBe(true);
		});

		it("should be enabled when tags are provided without keyword", () => {
			mockPostsService.searchPosts.mockResolvedValue({
				content: [],
				totalElements: 0,
				totalPages: 0,
				number: 0,
				size: 10,
				first: true,
				last: true,
			});

			const { result } = renderHook(
				() => useSearch({ keyword: "", tags: ["react"] }),
				{
					wrapper,
				},
			);

			expect(result.current.isEnabled).toBe(true);
		});

		it("should be disabled when no keyword, type, or tags", () => {
			const { result } = renderHook(() => useSearch({ keyword: "" }), {
				wrapper,
			});

			expect(result.current.isEnabled).toBe(false);
		});

		it("should be disabled when keyword is only whitespace", () => {
			const { result } = renderHook(() => useSearch({ keyword: "   " }), {
				wrapper,
			});

			expect(result.current.isEnabled).toBe(false);
		});

		it("should be disabled when all params are empty", () => {
			const { result } = renderHook(
				() => useSearch({ keyword: "", type: undefined, tags: [] }),
				{ wrapper },
			);

			expect(result.current.isEnabled).toBe(false);
		});
	});

	describe("search functionality", () => {
		it("should search posts by keyword", async () => {
			const mockPage = {
				content: [
					{
						id: 1,
						type: "ARTICLE" as const,
						title: "React Tutorial",
						content: "Learn React",
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
				],
				totalElements: 1,
				totalPages: 1,
				number: 0,
				size: 10,
				first: true,
				last: true,
			};
			mockPostsService.searchPosts.mockResolvedValue(mockPage);

			const { result } = renderHook(() => useSearch({ keyword: "react" }), {
				wrapper,
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data?.pages[0]).toEqual(mockPage);
			expect(mockPostsService.searchPosts).toHaveBeenCalledWith({
				keyword: "react",
				page: 0,
			});
		});

		it("should search with keyword and type filter", async () => {
			mockPostsService.searchPosts.mockResolvedValue({
				content: [],
				totalElements: 0,
				totalPages: 0,
				number: 0,
				size: 10,
				first: true,
				last: true,
			});

			renderHook(() => useSearch({ keyword: "react", type: "SNIPPET" }), {
				wrapper,
			});

			await waitFor(() =>
				expect(mockPostsService.searchPosts).toHaveBeenCalledWith({
					keyword: "react",
					type: "SNIPPET",
					page: 0,
				}),
			);
		});

		it("should search with keyword and tags", async () => {
			mockPostsService.searchPosts.mockResolvedValue({
				content: [],
				totalElements: 0,
				totalPages: 0,
				number: 0,
				size: 10,
				first: true,
				last: true,
			});

			renderHook(() => useSearch({ keyword: "test", tags: ["react", "vue"] }), {
				wrapper,
			});

			await waitFor(() =>
				expect(mockPostsService.searchPosts).toHaveBeenCalledWith({
					keyword: "test",
					tags: ["react", "vue"],
					page: 0,
				}),
			);
		});

		it("should support infinite scroll", async () => {
			const firstPage = {
				content: [{ id: 1 }],
				totalElements: 25,
				totalPages: 3,
				number: 0,
				size: 10,
				first: true,
				last: false,
			};
			mockPostsService.searchPosts.mockResolvedValue(firstPage);

			const { result } = renderHook(() => useSearch({ keyword: "test" }), {
				wrapper,
			});

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
			mockPostsService.searchPosts.mockResolvedValue(lastPage);

			const { result } = renderHook(() => useSearch({ keyword: "test" }), {
				wrapper,
			});

			await waitFor(() => expect(result.current.hasNextPage).toBe(false));
		});
	});
});
