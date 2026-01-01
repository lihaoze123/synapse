import { useInfiniteQuery } from "@tanstack/react-query";
import { postsService } from "../services/posts";
import type { PostType } from "../types";

export interface SearchParams {
	keyword: string;
	type?: PostType;
	tags?: string[];
}

export function useSearch(params: SearchParams) {
	return useInfiniteQuery({
		queryKey: ["search", params],
		queryFn: ({ pageParam = 0 }) =>
			postsService.searchPosts({ ...params, page: pageParam }),
		getNextPageParam: (lastPage) =>
			lastPage.last ? undefined : lastPage.number + 1,
		initialPageParam: 0,
		enabled:
			(params.keyword?.trim?.().length ?? 0) > 0 ||
			!!params.type ||
			(!!params.tags && params.tags.length > 0),
	});
}
