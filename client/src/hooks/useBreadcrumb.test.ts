import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useBreadcrumb } from "./useBreadcrumb";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
	useMatches: vi.fn(),
}));

const { useMatches } = await import("@tanstack/react-router");
const mockUseMatches = vi.mocked(useMatches);

describe("useBreadcrumb", () => {
	it("should return default home breadcrumb when no routes have breadcrumb config", () => {
		mockUseMatches.mockReturnValue([
			{ id: "1", pathname: "/", staticData: undefined },
		]);

		const { result } = renderHook(() => useBreadcrumb());

		expect(result.current).toEqual([{ id: "home", label: "首页" }]);
	});

	it("should extract breadcrumb from route staticData", () => {
		mockUseMatches.mockReturnValue([
			{
				id: "1",
				pathname: "/",
				staticData: {
					breadcrumb: {
						label: "首页",
						href: "/",
					},
				},
			},
		]);

		const { result } = renderHook(() => useBreadcrumb());

		// Last item has href removed
		expect(result.current).toEqual([{ id: "1", label: "首页" }]);
	});

	it("should support function labels for dynamic breadcrumbs", () => {
		mockUseMatches.mockReturnValue([
			{
				id: "1",
				pathname: "/",
				staticData: {
					breadcrumb: {
						label: "首页",
						href: "/",
					},
				},
				params: {},
			},
			{
				id: "2",
				pathname: "/posts/123",
				staticData: {
					breadcrumb: {
						label: (match: { params: { id: string } }) =>
							`文章 ${match.params.id}`,
					},
				},
				params: { id: "123" },
			},
		]);

		const { result } = renderHook(() => useBreadcrumb());

		expect(result.current).toEqual([
			{ id: "1", label: "首页", href: "/" },
			{ id: "2", label: "文章 123" },
		]);
	});

	it("should add home breadcrumb when first item is not home", () => {
		mockUseMatches.mockReturnValue([
			{
				id: "1",
				pathname: "/posts",
				staticData: {
					breadcrumb: {
						label: "文章列表",
						href: "/posts",
					},
				},
			},
		]);

		const { result } = renderHook(() => useBreadcrumb());

		expect(result.current).toEqual([
			{ id: "home", label: "首页", href: "/" },
			{ id: "1", label: "文章列表" },
		]);
	});

	it("should remove href from last item (current page)", () => {
		mockUseMatches.mockReturnValue([
			{
				id: "1",
				pathname: "/",
				staticData: {
					breadcrumb: {
						label: "首页",
						href: "/",
					},
				},
			},
			{
				id: "2",
				pathname: "/posts/123",
				staticData: {
					breadcrumb: {
						label: "文章详情",
						href: "/posts/123",
					},
				},
			},
		]);

		const { result } = renderHook(() => useBreadcrumb());

		expect(result.current).toEqual([
			{ id: "1", label: "首页", href: "/" },
			{ id: "2", label: "文章详情" },
		]);
	});

	it("should handle nested routes with breadcrumbs", () => {
		mockUseMatches.mockReturnValue([
			{
				id: "1",
				pathname: "/",
				staticData: {
					breadcrumb: {
						label: "首页",
						href: "/",
					},
				},
			},
			{
				id: "2",
				pathname: "/posts",
				staticData: {
					breadcrumb: {
						label: "文章列表",
						href: "/posts",
					},
				},
			},
			{
				id: "3",
				pathname: "/posts/123",
				staticData: {
					breadcrumb: {
						label: "文章详情",
					},
				},
			},
		]);

		const { result } = renderHook(() => useBreadcrumb());

		expect(result.current).toEqual([
			{ id: "1", label: "首页", href: "/" },
			{ id: "2", label: "文章列表", href: "/posts" },
			{ id: "3", label: "文章详情" },
		]);
	});

	it("should filter out routes without breadcrumb config", () => {
		mockUseMatches.mockReturnValue([
			{
				id: "1",
				pathname: "/",
				staticData: {
					breadcrumb: {
						label: "首页",
						href: "/",
					},
				},
			},
			{
				id: "2",
				pathname: "/some-route",
				staticData: undefined,
			},
			{
				id: "3",
				pathname: "/posts",
				staticData: {
					breadcrumb: {
						label: "文章",
						href: "/posts",
					},
				},
			},
		]);

		const { result } = renderHook(() => useBreadcrumb());

		expect(result.current).toEqual([
			{ id: "1", label: "首页", href: "/" },
			{ id: "3", label: "文章" },
		]);
	});
});
