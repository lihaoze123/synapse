import { describe, expect, it, vi } from "vitest";
import api from "./api";
import { followsService } from "./follows";

vi.mock("./api");

const mockApi = vi.mocked(api);

describe("followsService", () => {
	describe("getFollowing", () => {
		it("should fetch following list", async () => {
			const mockPage = {
				content: [
					{
						id: 1,
						follower: { id: 1, username: "user1", avatarUrl: null },
						following: { id: 2, username: "user2", avatarUrl: null },
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

			const result = await followsService.getFollowing(1);

			expect(result).toEqual(mockPage);
			expect(mockApi.get).toHaveBeenCalledWith(
				"/follows/following?userId=1&page=0&size=20",
			);
		});

		it("should fetch following with pagination", async () => {
			mockApi.get.mockResolvedValue({
				data: {
					success: true,
					data: {
						content: [],
						totalElements: 0,
						totalPages: 0,
						number: 0,
						last: true,
					},
				},
			});

			await followsService.getFollowing(1, 1, 30);

			expect(mockApi.get).toHaveBeenCalledWith(
				"/follows/following?userId=1&page=1&size=30",
			);
		});

		it("should throw error on failed fetch", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "User not found" },
			});

			await expect(followsService.getFollowing(999)).rejects.toThrow(
				"User not found",
			);
		});
	});

	describe("getFollowers", () => {
		it("should fetch followers list", async () => {
			const mockPage = {
				content: [
					{
						id: 1,
						follower: { id: 2, username: "user2", avatarUrl: null },
						following: { id: 1, username: "user1", avatarUrl: null },
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

			const result = await followsService.getFollowers(1);

			expect(result).toEqual(mockPage);
			expect(mockApi.get).toHaveBeenCalledWith(
				"/follows/followers?userId=1&page=0&size=20",
			);
		});

		it("should throw error on failed fetch", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "User not found" },
			});

			await expect(followsService.getFollowers(999)).rejects.toThrow(
				"User not found",
			);
		});
	});

	describe("checkFollowing", () => {
		it("should return true when following", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: true, data: true },
			});

			const result = await followsService.checkFollowing(2);

			expect(result).toBe(true);
			expect(mockApi.get).toHaveBeenCalledWith("/follows/check/2");
		});

		it("should return false when not following", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: true, data: false },
			});

			const result = await followsService.checkFollowing(2);

			expect(result).toBe(false);
		});

		it("should throw error on failed check", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "Unauthorized" },
			});

			await expect(followsService.checkFollowing(2)).rejects.toThrow(
				"Unauthorized",
			);
		});
	});

	describe("getFollowCounts", () => {
		it("should fetch follow counts", async () => {
			const mockCounts = { followingCount: 10, followerCount: 5 };
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockCounts },
			});

			const result = await followsService.getFollowCounts(1);

			expect(result).toEqual(mockCounts);
			expect(mockApi.get).toHaveBeenCalledWith("/follows/counts/1");
		});

		it("should throw error on failed fetch", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "User not found" },
			});

			await expect(followsService.getFollowCounts(999)).rejects.toThrow(
				"User not found",
			);
		});
	});

	describe("followUser", () => {
		it("should follow a user", async () => {
			const mockFollow = {
				id: 1,
				follower: { id: 1, username: "user1", avatarUrl: null },
				following: { id: 2, username: "user2", avatarUrl: null },
				createdAt: "2024-01-01T00:00:00",
			};
			mockApi.post.mockResolvedValue({
				data: { success: true, data: mockFollow },
			});

			const result = await followsService.followUser(2);

			expect(result).toEqual(mockFollow);
			expect(mockApi.post).toHaveBeenCalledWith("/follows/2");
		});

		it("should throw error on failed follow", async () => {
			mockApi.post.mockResolvedValue({
				data: { success: false, message: "User not found" },
			});

			await expect(followsService.followUser(999)).rejects.toThrow(
				"User not found",
			);
		});
	});

	describe("unfollowUser", () => {
		it("should unfollow a user", async () => {
			mockApi.delete.mockResolvedValue({
				data: { success: true },
			});

			await followsService.unfollowUser(2);

			expect(mockApi.delete).toHaveBeenCalledWith("/follows/2");
		});

		it("should throw error on failed unfollow", async () => {
			mockApi.delete.mockResolvedValue({
				data: { success: false, message: "Not following" },
			});

			await expect(followsService.unfollowUser(2)).rejects.toThrow(
				"Not following",
			);
		});
	});
});
