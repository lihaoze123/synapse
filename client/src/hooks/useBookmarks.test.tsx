import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bookmarksService } from "../services/bookmarks";
import {
	useBookmarkCount,
	useBookmarkStatus,
	useBookmarks,
	useBookmarkToggle,
} from "./useBookmarks";

vi.mock("../services/bookmarks");

const mockBookmarksService = vi.mocked(bookmarksService);

describe("useBookmarks hook", () => {
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

	describe("useBookmarkStatus", () => {
		it("should fetch bookmark status", async () => {
			mockBookmarksService.check.mockResolvedValue(true);

			const { result } = renderHook(() => useBookmarkStatus(1), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toBe(true);
			expect(mockBookmarksService.check).toHaveBeenCalledWith(1);
		});

		it("should not fetch when postId is 0", () => {
			renderHook(() => useBookmarkStatus(0), { wrapper });

			expect(mockBookmarksService.check).not.toHaveBeenCalled();
		});

		it("should not fetch when disabled", () => {
			renderHook(() => useBookmarkStatus(1, false), { wrapper });

			expect(mockBookmarksService.check).not.toHaveBeenCalled();
		});

		it("should return false when not bookmarked", async () => {
			mockBookmarksService.check.mockResolvedValue(false);

			const { result } = renderHook(() => useBookmarkStatus(1), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toBe(false);
		});
	});

	describe("useBookmarkCount", () => {
		it("should fetch bookmark count", async () => {
			mockBookmarksService.getCount.mockResolvedValue(5);

			const { result } = renderHook(() => useBookmarkCount(1), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toBe(5);
			expect(mockBookmarksService.getCount).toHaveBeenCalledWith(1);
		});

		it("should use initial data when provided", () => {
			renderHook(() => useBookmarkCount(1, 10), { wrapper });

			expect(queryClient.getQueryData(["bookmark-count", 1])).toBe(10);
		});

		it("should not fetch when postId is 0", () => {
			renderHook(() => useBookmarkCount(0), { wrapper });

			expect(mockBookmarksService.getCount).not.toHaveBeenCalled();
		});
	});

	describe("useBookmarkToggle", () => {
		it("should add bookmark when not bookmarked", async () => {
			const mockBookmark = {
				id: 1,
				post: {
					id: 1,
					type: "ARTICLE" as const,
					title: "Test",
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
			mockBookmarksService.add.mockResolvedValue(mockBookmark);

			const { result } = renderHook(() => useBookmarkToggle(1), { wrapper });

			await result.current.mutateAsync(false);

			expect(mockBookmarksService.add).toHaveBeenCalledWith(1);
			expect(mockBookmarksService.remove).not.toHaveBeenCalled();
		});

		it("should remove bookmark when bookmarked", async () => {
			mockBookmarksService.remove.mockResolvedValue(undefined);

			const { result } = renderHook(() => useBookmarkToggle(1), { wrapper });

			await result.current.mutateAsync(true);

			expect(mockBookmarksService.remove).toHaveBeenCalledWith(1);
			expect(mockBookmarksService.add).not.toHaveBeenCalled();
		});

		it("should optimistically update status and count", async () => {
			mockBookmarksService.add.mockResolvedValue({
				id: 1,
				post: {
					id: 1,
					type: "ARTICLE" as const,
					title: "Test",
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
			});

			queryClient.setQueryData(["bookmark-count", 1], 5);

			const { result } = renderHook(() => useBookmarkToggle(1), { wrapper });

			result.current.mutateAsync(false);

			await waitFor(() => {
				expect(queryClient.getQueryData(["bookmark-status", 1])).toBe(true);
				expect(queryClient.getQueryData(["bookmark-count", 1])).toBe(6);
			});
		});

		it("should rollback on error", async () => {
			mockBookmarksService.add.mockRejectedValue(new Error("Add failed"));

			queryClient.setQueryData(["bookmark-status", 1], false);
			queryClient.setQueryData(["bookmark-count", 1], 5);

			const { result } = renderHook(() => useBookmarkToggle(1), { wrapper });

			await expect(result.current.mutateAsync(false)).rejects.toThrow(
				"Add failed",
			);

			await waitFor(() => {
				expect(queryClient.getQueryData(["bookmark-status", 1])).toBe(false);
				expect(queryClient.getQueryData(["bookmark-count", 1])).toBe(5);
			});
		});

		it("should handle remove error", async () => {
			mockBookmarksService.remove.mockRejectedValue(new Error("Remove failed"));

			queryClient.setQueryData(["bookmark-status", 1], true);
			queryClient.setQueryData(["bookmark-count", 1], 5);

			const { result } = renderHook(() => useBookmarkToggle(1), { wrapper });

			await expect(result.current.mutateAsync(true)).rejects.toThrow(
				"Remove failed",
			);
		});
	});

	describe("useBookmarks", () => {
		it("should fetch bookmarks list with infinite scroll", async () => {
			const mockPage = {
				content: [
					{
						id: 1,
						post: {
							id: 1,
							type: "ARTICLE" as const,
							title: "Test",
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
			mockBookmarksService.list.mockResolvedValue(mockPage);

			const { result } = renderHook(() => useBookmarks(), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data?.pages[0]).toEqual(mockPage);
		});

		it("should fetch bookmarks with custom size", async () => {
			mockBookmarksService.list.mockResolvedValue({
				content: [],
				totalElements: 0,
				totalPages: 0,
				number: 0,
				last: true,
			});

			renderHook(() => useBookmarks({ size: 20 }), { wrapper });

			await waitFor(() =>
				expect(mockBookmarksService.list).toHaveBeenCalledWith({
					page: 0,
					size: 20,
				}),
			);
		});
	});
});
