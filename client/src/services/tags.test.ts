import { describe, expect, it, vi, beforeEach } from "vitest";
import api from "./api";
import { tagsService } from "./tags";

vi.mock("./api");

const mockApi = vi.mocked(api);

describe("tagsService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getPopularTags", () => {
		it("should fetch popular tags with default limit", async () => {
			const mockTags = [
				{ id: 1, name: "JavaScript", icon: "js" },
				{ id: 2, name: "Python", icon: "py" },
				{ id: 3, name: "React", icon: "react" },
			];
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockTags },
			});

			const result = await tagsService.getPopularTags();

			expect(result).toEqual(mockTags);
			expect(mockApi.get).toHaveBeenCalledWith("/tags?limit=10");
		});

		it("should fetch popular tags with custom limit", async () => {
			const mockTags = [
				{ id: 1, name: "JavaScript", icon: "js" },
				{ id: 2, name: "Python", icon: "py" },
			];
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockTags },
			});

			const result = await tagsService.getPopularTags(5);

			expect(result).toEqual(mockTags);
			expect(mockApi.get).toHaveBeenCalledWith("/tags?limit=5");
		});

		it("should throw error when response is unsuccessful", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "Server error" },
			});

			await expect(tagsService.getPopularTags()).rejects.toThrow("Server error");
		});

		it("should throw default error message when no message provided", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false },
			});

			await expect(tagsService.getPopularTags()).rejects.toThrow(
				"Failed to fetch tags",
			);
		});
	});

	describe("getAllTags", () => {
		it("should fetch all tags", async () => {
			const mockTags = [
				{ id: 1, name: "JavaScript", icon: "js" },
				{ id: 2, name: "Python", icon: "py" },
				{ id: 3, name: "React", icon: "react" },
				{ id: 4, name: "Vue", icon: "vue" },
				{ id: 5, name: "TypeScript", icon: "ts" },
			];
			mockApi.get.mockResolvedValue({
				data: { success: true, data: mockTags },
			});

			const result = await tagsService.getAllTags();

			expect(result).toEqual(mockTags);
			expect(mockApi.get).toHaveBeenCalledWith("/tags/all");
		});

		it("should throw error when response is unsuccessful", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false, message: "Database error" },
			});

			await expect(tagsService.getAllTags()).rejects.toThrow("Database error");
		});

		it("should throw default error message when no message provided", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: false },
			});

			await expect(tagsService.getAllTags()).rejects.toThrow(
				"Failed to fetch tags",
			);
		});

		it("should return empty array when no tags exist", async () => {
			mockApi.get.mockResolvedValue({
				data: { success: true, data: [] },
			});

			const result = await tagsService.getAllTags();

			expect(result).toEqual([]);
		});
	});
});
