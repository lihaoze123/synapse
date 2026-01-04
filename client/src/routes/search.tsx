import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import { Feed } from "@/components/feed";
import { Layout } from "@/components/layout";
import { AnimatedPage } from "@/components/ui/animations";
import { useSearch as useSearchPosts } from "@/hooks/useSearch";
import type { PostType } from "@/types";

interface SearchParams {
	keyword: string;
	type?: PostType;
	tags?: string[];
}

export const Route = createFileRoute("/search")({
	component: SearchPage,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		const keyword = typeof search.keyword === "string" ? search.keyword : "";
		const type =
			typeof search.type === "string" &&
			["SNIPPET", "ARTICLE", "MOMENT"].includes(search.type)
				? (search.type as PostType)
				: undefined;
		let tags: string[] | undefined;
		if (Array.isArray(search.tags)) {
			tags = search.tags.filter(
				(t): t is string => typeof t === "string" && t.trim().length > 0,
			);
		} else if (
			typeof search.tags === "string" &&
			search.tags.trim().length > 0
		) {
			tags = search.tags
				.split(",")
				.map((t) => t.trim())
				.filter(Boolean);
		}
		return { keyword, type, tags };
	},
	staticData: {
		breadcrumb: {
			label: "搜索",
		},
	},
});

function SearchPage() {
	const search = useSearch({ from: "/search" });

	const {
		data,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		error,
	} = useSearchPosts({
		keyword: search.keyword,
		type: search.type,
		tags: search.tags,
	});

	const posts = useMemo(() => {
		return data?.pages.flatMap((page) => page.content) ?? [];
	}, [data]);

	const getEmptyMessage = () => {
		const typeLabels: Record<PostType, string> = {
			SNIPPET: "代码片段",
			ARTICLE: "文章",
			MOMENT: "动态",
		};

		if (search.type) {
			return `未找到包含 "${search.keyword}" 的 ${typeLabels[search.type]}${
				search.tags?.length ? `（标签: ${search.tags.join(", ")}）` : ""
			}`;
		}
		return `未找到包含 "${search.keyword}" 的内容${
			search.tags?.length ? `（标签: ${search.tags.join(", ")}）` : ""
		}`;
	};

	return (
		<Layout>
			<AnimatedPage transition="fade">
				<div className="space-y-4">
					{search.keyword && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<span>搜索:</span>
							<span className="px-2 py-0.5 bg-secondary rounded-full">
								"{search.keyword}"
							</span>
							{search.type && (
								<span className="px-2 py-0.5 bg-secondary rounded-full">
									{search.type === "SNIPPET" && "代码片段"}
									{search.type === "ARTICLE" && "文章"}
									{search.type === "MOMENT" && "动态"}
								</span>
							)}
							{search.tags &&
								search.tags.length > 0 &&
								search.tags.slice(0, 3).map((t) => (
									<span
										key={t}
										className="px-2 py-0.5 bg-secondary rounded-full"
									>
										标签: {t}
									</span>
								))}
							{search.tags && search.tags.length > 3 && (
								<span className="px-2 py-0.5 bg-secondary rounded-full">
									+{search.tags.length - 3}
								</span>
							)}
						</div>
					)}

					{error && (
						<div className="p-4 text-center text-red-600 bg-red-50 rounded-lg">
							搜索失败：{error.message}
						</div>
					)}

					<Feed
						posts={posts}
						isLoading={isLoading}
						isFetchingNextPage={isFetchingNextPage}
						hasNextPage={hasNextPage}
						fetchNextPage={fetchNextPage}
						emptyMessage={getEmptyMessage()}
					/>
				</div>
			</AnimatedPage>
		</Layout>
	);
}
