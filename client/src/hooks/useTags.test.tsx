import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useAllTags, usePopularTags } from "./useTags";
import { tagsService } from "../services/tags";

vi.mock("../services/tags");

const mockTagsService = vi.mocked(tagsService);

describe("useTags", () => {
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

	describe("usePopularTags", () => {
		it("should fetch popular tags", async () => {
			const mockTags = [
				{ id: 1, name: "React", icon: "⚛️" },
				{ id: 2, name: "Vue", icon: "💚" },
			];
			mockTagsService.getPopularTags.mockResolvedValue(mockTags);

			const { result } = renderHook(() => usePopularTags(), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockTags);
			expect(mockTagsService.getPopularTags).toHaveBeenCalledWith(10);
		});

		it("should fetch popular tags with custom limit", async () => {
			const mockTags = [{ id: 1, name: "React", icon: "⚛️" }];
			mockTagsService.getPopularTags.mockResolvedValue(mockTags);

			const { result } = renderHook(() => usePopularTags(5), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(mockTagsService.getPopularTags).toHaveBeenCalledWith(5);
		});
	});

	describe("useAllTags", () => {
		it("should fetch all tags", async () => {
			const mockTags = [
				{ id: 1, name: "React", icon: "⚛️" },
				{ id: 2, name: "Vue", icon: "💚" },
				{ id: 3, name: "Angular", icon: "🅰️" },
			];
			mockTagsService.getAllTags.mockResolvedValue(mockTags);

			const { result } = renderHook(() => useAllTags(), { wrapper });

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockTags);
			expect(mockTagsService.getAllTags).toHaveBeenCalled();
		});

		it("should be enabled by default", () => {
			const { result } = renderHook(() => useAllTags(), { wrapper });

			expect(result.current.isEnabled).toBe(true);
		});

		it("should be disabled when enabled is false", () => {
			const { result } = renderHook(() => useAllTags(false), { wrapper });

			expect(result.current.isEnabled).toBe(false);
			expect(mockTagsService.getAllTags).not.toHaveBeenCalled();
		});
	});
});
