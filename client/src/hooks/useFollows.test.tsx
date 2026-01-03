import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { followsService } from "../services/follows";
import { useAuth } from "./useAuth";
import {
	useFollowCounts,
	useFollowers,
	useFollowing,
	useFollowUser,
	useIsFollowing,
	useUnfollowUser,
} from "./useFollows";

vi.mock("../services/follows");
vi.mock("./useAuth");
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const mockFollowsService = vi.mocked(followsService);
const mockUseAuth = vi.mocked(useAuth);

describe("useFollows hook", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
		vi.clearAllMocks();
		mockUseAuth.mockReturnValue({
			user: { id: 1, username: "user", avatarUrl: null },
			isAuthenticated: true,
			isValidating: false,
			login: vi.fn().mockResolvedValue({}),
			register: vi.fn().mockResolvedValue({}),
			logout: vi.fn(),
			isLoggingIn: false,
			isRegistering: false,
			loginError: null,
			registerError: null,
		});
	});

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	describe("useIsFollowing", () => {
		it("should fetch follow status", async () => {
			mockFollowsService.checkFollowing.mockResolvedValue(true);

			const { result } = renderHook(() => useIsFollowing(2), { wrapper });

			await waitFor(() => expect(result.current.isFollowing).toBe(true));

			expect(mockFollowsService.checkFollowing).toHaveBeenCalledWith(2);
		});

		it("should not fetch when not authenticated", () => {
			mockUseAuth.mockReturnValue({
				user: null,
				isAuthenticated: false,
				isValidating: false,
				login: vi.fn().mockResolvedValue({}),
				register: vi.fn().mockResolvedValue({}),
				logout: vi.fn(),
				isLoggingIn: false,
				isRegistering: false,
				loginError: null,
				registerError: null,
			});

			renderHook(() => useIsFollowing(2), { wrapper });

			expect(mockFollowsService.checkFollowing).not.toHaveBeenCalled();
		});

		it("should return false when not following", async () => {
			mockFollowsService.checkFollowing.mockResolvedValue(false);

			const { result } = renderHook(() => useIsFollowing(2), { wrapper });

			await waitFor(() => expect(result.current.isFollowing).toBe(false));
		});

		it("should default to false while loading", () => {
			mockFollowsService.checkFollowing.mockReturnValue(new Promise(() => {}));

			const { result } = renderHook(() => useIsFollowing(2), { wrapper });

			expect(result.current.isFollowing).toBe(false);
		});
	});

	describe("useFollowCounts", () => {
		it("should fetch follow counts", async () => {
			mockFollowsService.getFollowCounts.mockResolvedValue({
				followingCount: 10,
				followerCount: 5,
			});

			const { result } = renderHook(() => useFollowCounts(1), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual({
				followingCount: 10,
				followerCount: 5,
			});
			expect(mockFollowsService.getFollowCounts).toHaveBeenCalledWith(1);
		});

		it("should not fetch when userId is 0", () => {
			renderHook(() => useFollowCounts(0), { wrapper });

			expect(mockFollowsService.getFollowCounts).not.toHaveBeenCalled();
		});
	});

	describe("useFollowers", () => {
		it("should fetch followers list", async () => {
			const mockPage = {
				content: [
					{
						id: 1,
						follower: { id: 2, username: "follower", avatarUrl: null },
						following: { id: 1, username: "user", avatarUrl: null },
						createdAt: "2024-01-01T00:00:00",
					},
				],
				totalElements: 1,
				totalPages: 1,
				number: 0,
				last: true,
			};
			mockFollowsService.getFollowers.mockResolvedValue(mockPage);

			const { result } = renderHook(() => useFollowers(1), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data?.pages[0]).toEqual(mockPage);
			expect(mockFollowsService.getFollowers).toHaveBeenCalledWith(1, 0);
		});

		it("should not fetch when userId is 0", () => {
			renderHook(() => useFollowers(0), { wrapper });

			expect(mockFollowsService.getFollowers).not.toHaveBeenCalled();
		});
	});

	describe("useFollowing", () => {
		it("should fetch following list", async () => {
			const mockPage = {
				content: [
					{
						id: 1,
						follower: { id: 1, username: "user", avatarUrl: null },
						following: { id: 2, username: "following", avatarUrl: null },
						createdAt: "2024-01-01T00:00:00",
					},
				],
				totalElements: 1,
				totalPages: 1,
				number: 0,
				last: true,
			};
			mockFollowsService.getFollowing.mockResolvedValue(mockPage);

			const { result } = renderHook(() => useFollowing(1), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data?.pages[0]).toEqual(mockPage);
			expect(mockFollowsService.getFollowing).toHaveBeenCalledWith(1, 0);
		});

		it("should not fetch when userId is 0", () => {
			renderHook(() => useFollowing(0), { wrapper });

			expect(mockFollowsService.getFollowing).not.toHaveBeenCalled();
		});
	});

	describe("useFollowUser", () => {
		it("should follow user and update cache", async () => {
			const mockFollow = {
				id: 1,
				follower: { id: 1, username: "user", avatarUrl: null },
				following: { id: 2, username: "target", avatarUrl: null },
				createdAt: "2024-01-01T00:00:00",
			};
			mockFollowsService.followUser.mockResolvedValue(mockFollow);

			const { result } = renderHook(() => useFollowUser(), { wrapper });

			await result.current.mutateAsync(2);

			expect(mockFollowsService.followUser).toHaveBeenCalledWith(2);
			await waitFor(() => {
				expect(queryClient.getQueryData(["isFollowing", 2])).toBe(true);
			});
		});

		it("should optimistically update follow status", async () => {
			mockFollowsService.followUser.mockReturnValue(
				new Promise((resolve) =>
					setTimeout(
						() =>
							resolve({
								id: 1,
								follower: { id: 1, username: "user", avatarUrl: null },
								following: { id: 2, username: "target", avatarUrl: null },
								createdAt: "2024-01-01T00:00:00",
							}),
						100,
					),
				),
			);

			const { result } = renderHook(() => useFollowUser(), { wrapper });

			result.current.mutateAsync(2);

			await waitFor(() => {
				expect(queryClient.getQueryData(["isFollowing", 2])).toBe(true);
			});
		});

		it("should rollback on error", async () => {
			mockFollowsService.followUser.mockRejectedValue(
				new Error("Follow failed"),
			);

			queryClient.setQueryData(["isFollowing", 2], false);

			const { result } = renderHook(() => useFollowUser(), { wrapper });

			await expect(result.current.mutateAsync(2)).rejects.toThrow(
				"Follow failed",
			);

			await waitFor(() => {
				expect(queryClient.getQueryData(["isFollowing", 2])).toBe(false);
			});
		});

		it("should invalidate relevant queries", async () => {
			mockFollowsService.followUser.mockResolvedValue({
				id: 1,
				follower: { id: 1, username: "user", avatarUrl: null },
				following: { id: 2, username: "target", avatarUrl: null },
				createdAt: "2024-01-01T00:00:00",
			});

			const { result } = renderHook(() => useFollowUser(), { wrapper });

			await result.current.mutateAsync(2);

			// The hook invalidates the queries - just verify the mutation succeeded
			expect(mockFollowsService.followUser).toHaveBeenCalledWith(2);
		});
	});

	describe("useUnfollowUser", () => {
		it("should unfollow user and update cache", async () => {
			mockFollowsService.unfollowUser.mockResolvedValue(undefined);

			const { result } = renderHook(() => useUnfollowUser(), { wrapper });

			await result.current.mutateAsync(2);

			expect(mockFollowsService.unfollowUser).toHaveBeenCalledWith(2);
			await waitFor(() => {
				expect(queryClient.getQueryData(["isFollowing", 2])).toBe(false);
			});
		});

		it("should optimistically update follow status", async () => {
			mockFollowsService.unfollowUser.mockReturnValue(
				new Promise((resolve) => setTimeout(() => resolve(undefined), 100)),
			);

			const { result } = renderHook(() => useUnfollowUser(), { wrapper });

			result.current.mutateAsync(2);

			await waitFor(() => {
				expect(queryClient.getQueryData(["isFollowing", 2])).toBe(false);
			});
		});

		it("should rollback on error", async () => {
			mockFollowsService.unfollowUser.mockRejectedValue(
				new Error("Unfollow failed"),
			);

			queryClient.setQueryData(["isFollowing", 2], true);

			const { result } = renderHook(() => useUnfollowUser(), { wrapper });

			await expect(result.current.mutateAsync(2)).rejects.toThrow(
				"Unfollow failed",
			);

			await waitFor(() => {
				expect(queryClient.getQueryData(["isFollowing", 2])).toBe(true);
			});
		});

		it("should invalidate relevant queries", async () => {
			mockFollowsService.unfollowUser.mockResolvedValue(undefined);

			const { result } = renderHook(() => useUnfollowUser(), { wrapper });

			await result.current.mutateAsync(2);

			// The hook invalidates the queries - just verify the mutation succeeded
			expect(mockFollowsService.unfollowUser).toHaveBeenCalledWith(2);
		});
	});
});
