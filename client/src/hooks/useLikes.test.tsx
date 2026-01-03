import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { likesService } from "../services/likes";
import { useLikeComment, useLikePost } from "./useLikes";

vi.mock("../services/likes");

const mockLikesService = vi.mocked(likesService);

describe("useLikes hook", () => {
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

	describe("useLikePost", () => {
		it("should toggle like on post", async () => {
			mockLikesService.togglePost.mockResolvedValue({ liked: true, count: 5 });

			const { result } = renderHook(() => useLikePost(1), { wrapper });

			await result.current.mutateAsync();

			expect(mockLikesService.togglePost).toHaveBeenCalledWith(1);
		});

		it("should unlike post", async () => {
			mockLikesService.togglePost.mockResolvedValue({ liked: false, count: 4 });

			const { result } = renderHook(() => useLikePost(1), { wrapper });

			await result.current.mutateAsync();

			expect(mockLikesService.togglePost).toHaveBeenCalledWith(1);
		});

		it("should invalidate posts queries after toggle", async () => {
			mockLikesService.togglePost.mockResolvedValue({ liked: true, count: 5 });

			const { result } = renderHook(() => useLikePost(1), { wrapper });

			// Set some initial data to verify invalidation
			queryClient.setQueryData(["posts"], { data: [] });

			const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

			await result.current.mutateAsync();

			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["posts"] });
			invalidateSpy.mockRestore();
		});

		it("should handle toggle error", async () => {
			mockLikesService.togglePost.mockRejectedValue(new Error("Toggle failed"));

			const { result } = renderHook(() => useLikePost(1), { wrapper });

			await expect(result.current.mutateAsync()).rejects.toThrow(
				"Toggle failed",
			);
		});

		it("should show pending state during mutation", async () => {
			let resolvePromise: (value: { liked: boolean; count: number }) => void;
			mockLikesService.togglePost.mockReturnValue(
				new Promise((resolve) => {
					resolvePromise = resolve;
				}),
			);

			const { result } = renderHook(() => useLikePost(1), { wrapper });

			result.current.mutate();

			await waitFor(() => expect(result.current.isPending).toBe(true));

			resolvePromise!({ liked: true, count: 5 });

			await waitFor(() => expect(result.current.isPending).toBe(false));
		});
	});

	describe("useLikeComment", () => {
		it("should toggle like on comment", async () => {
			mockLikesService.toggleComment.mockResolvedValue({
				liked: true,
				count: 3,
			});

			const { result } = renderHook(() => useLikeComment(1), { wrapper });

			await result.current.mutateAsync();

			expect(mockLikesService.toggleComment).toHaveBeenCalledWith(1);
		});

		it("should unlike comment", async () => {
			mockLikesService.toggleComment.mockResolvedValue({
				liked: false,
				count: 2,
			});

			const { result } = renderHook(() => useLikeComment(1), { wrapper });

			await result.current.mutateAsync();

			expect(mockLikesService.toggleComment).toHaveBeenCalledWith(1);
		});

		it("should invalidate comments queries after toggle", async () => {
			mockLikesService.toggleComment.mockResolvedValue({
				liked: true,
				count: 3,
			});

			const { result } = renderHook(() => useLikeComment(1), { wrapper });

			// Set some initial data to verify invalidation
			queryClient.setQueryData(["comments"], { data: [] });

			const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

			await result.current.mutateAsync();

			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["comments"] });
			invalidateSpy.mockRestore();
		});

		it("should handle toggle error", async () => {
			mockLikesService.toggleComment.mockRejectedValue(
				new Error("Toggle failed"),
			);

			const { result } = renderHook(() => useLikeComment(1), { wrapper });

			await expect(result.current.mutateAsync()).rejects.toThrow(
				"Toggle failed",
			);
		});

		it("should show pending state during mutation", async () => {
			let resolvePromise: (value: { liked: boolean; count: number }) => void;
			mockLikesService.toggleComment.mockReturnValue(
				new Promise((resolve) => {
					resolvePromise = resolve;
				}),
			);

			const { result } = renderHook(() => useLikeComment(1), { wrapper });

			result.current.mutate();

			await waitFor(() => expect(result.current.isPending).toBe(true));

			resolvePromise!({ liked: true, count: 3 });

			await waitFor(() => expect(result.current.isPending).toBe(false));
		});
	});
});
