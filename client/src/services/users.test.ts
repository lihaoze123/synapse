import { describe, expect, it, vi } from "vitest";
import api from "./api";
import { userService } from "./users";

vi.mock("./api");

const mockApi = vi.mocked(api);

describe("userService", () => {
	describe("getUser", () => {
		it("should fetch user by id", async () => {
			const mockUser = {
				id: 1,
				username: "testuser",
				avatarUrl: null,
				displayName: null,
				bio: null,
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockUser },
			});

			const result = await userService.getUser(1);

			expect(result).toEqual(mockUser);
			expect(mockApi.get).toHaveBeenCalledWith("/users/1");
		});

		it("should throw error on failed fetch", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "User not found" },
			});

			await expect(userService.getUser(999)).rejects.toThrow("User not found");
		});
	});

	describe("getUserByUsername", () => {
		it("should fetch user by username", async () => {
			const mockUser = {
				id: 1,
				username: "testuser",
				avatarUrl: null,
				displayName: "Test User",
				bio: "Test bio",
			};
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockUser },
			});

			const result = await userService.getUserByUsername("testuser");

			expect(result).toEqual(mockUser);
			expect(mockApi.get).toHaveBeenCalledWith("/users/username/testuser");
		});

		it("should throw error on failed fetch", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "User not found" },
			});

			await expect(
				userService.getUserByUsername("nonexistent"),
			).rejects.toThrow("User not found");
		});
	});

	describe("getUserPosts", () => {
		it("should fetch user posts with default params", async () => {
			const mockPage = {
				content: [
					{
						id: 1,
						type: "ARTICLE" as const,
						title: "Test Post",
						content: "Content",
						language: null,
						summary: null,
						coverImage: null,
						images: null,
						attachments: null,
						user: { id: 1, username: "testuser", avatarUrl: null },
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
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockPage },
			});

			const result = await userService.getUserPosts(1);

			expect(result).toEqual(mockPage);
			expect(mockApi.get).toHaveBeenCalledWith("/users/1/posts?page=0&size=10");
		});

		it("should fetch user posts with pagination", async () => {
			mockApi.get.mockResolvedValue({
				data: {
					success: true,
					data: {
						content: [],
						totalElements: 0,
						totalPages: 0,
						number: 0,
						size: 10,
						first: true,
						last: true,
					},
				},
			});

			await userService.getUserPosts(1, 1, 20);

			expect(mockApi.get).toHaveBeenCalledWith("/users/1/posts?page=1&size=20");
		});

		it("should throw error on failed fetch", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "User not found" },
			});

			await expect(userService.getUserPosts(999)).rejects.toThrow(
				"User not found",
			);
		});
	});

	describe("updateProfile", () => {
		it("should update user profile", async () => {
			const mockUser = {
				id: 1,
				username: "testuser",
				avatarUrl: "new-avatar.png",
				displayName: "Updated Name",
				bio: "Updated bio",
			};
			mockApi.put.mockResolvedValue({
				data: { success: true, data: mockUser },
			});

			const result = await userService.updateProfile({
				displayName: "Updated Name",
				bio: "Updated bio",
				avatarUrl: "new-avatar.png",
			});

			expect(result).toEqual(mockUser);
			expect(mockApi.put).toHaveBeenCalledWith("/users/profile", {
				displayName: "Updated Name",
				bio: "Updated bio",
				avatarUrl: "new-avatar.png",
			});
		});

		it("should update partial profile", async () => {
			const mockUser = {
				id: 1,
				username: "testuser",
				avatarUrl: null,
				displayName: "New Name",
				bio: null,
			};
			mockApi.put.mockResolvedValue({
				data: { success: true, data: mockUser },
			});

			await userService.updateProfile({ displayName: "New Name" });

			expect(mockApi.put).toHaveBeenCalledWith("/users/profile", {
				displayName: "New Name",
			});
		});

		it("should throw error on failed update", async () => {
			mockApi.put.mockResolvedValue({
				data: { success: false, message: "Unauthorized" },
			});

			await expect(userService.updateProfile({ bio: "test" })).rejects.toThrow(
				"Unauthorized",
			);
		});
	});

	describe("uploadFile", () => {
		it("should upload file successfully", async () => {
			const mockFile = new File(["content"], "test.png", { type: "image/png" });
			const mockResponse = {
				filename: "uuid-filename.png",
				url: "/uploads/uuid-filename.png",
			};
			mockApi.post.mockResolvedValue({
				data: { success: true, data: mockResponse },
			});

			const result = await userService.uploadFile(mockFile);

			expect(result).toEqual(mockResponse);
			expect(mockApi.post).toHaveBeenCalledWith(
				"/upload",
				expect.any(FormData),
				expect.objectContaining({
					headers: { "Content-Type": "multipart/form-data" },
				}),
			);
		});

		it("should throw error on failed upload", async () => {
			const mockFile = new File(["content"], "test.png", { type: "image/png" });
			mockApi.post.mockResolvedValue({
				data: { success: false, message: "Upload failed" },
			});

			await expect(userService.uploadFile(mockFile)).rejects.toThrow(
				"Upload failed",
			);
		});
	});

	describe("uploadAttachment", () => {
		it("should upload attachment successfully", async () => {
			const mockFile = new File(["content"], "document.pdf", {
				type: "application/pdf",
			});
			const mockResponse = {
				filename: "document.pdf",
				storedName: "uuid-document.pdf",
				url: "/uploads/attachments/uuid-document.pdf",
				fileSize: 1024,
				contentType: "application/pdf",
			};
			mockApi.post.mockResolvedValue({
				data: { success: true, data: mockResponse },
			});

			const result = await userService.uploadAttachment(mockFile);

			expect(result).toEqual(mockResponse);
			expect(mockApi.post).toHaveBeenCalledWith(
				"/upload/attachment",
				expect.any(FormData),
				expect.objectContaining({
					headers: { "Content-Type": "multipart/form-data" },
				}),
			);
		});

		it("should throw error on failed attachment upload", async () => {
			const mockFile = new File(["content"], "document.pdf", {
				type: "application/pdf",
			});
			mockApi.post.mockResolvedValue({
				data: { success: false, message: "Upload failed" },
			});

			await expect(userService.uploadAttachment(mockFile)).rejects.toThrow(
				"Upload failed",
			);
		});
	});
});
