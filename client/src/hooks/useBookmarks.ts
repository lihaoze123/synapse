import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	bookmarksService,
	type GetBookmarksParams,
} from "../services/bookmarks";

const statusKey = (postId: number) => ["bookmark-status", postId];
const countKey = (postId: number) => ["bookmark-count", postId];
const listKey = (params: Omit<GetBookmarksParams, "page"> = {}) => [
	"bookmarks",
	params,
];

export function useBookmarkStatus(postId: number, enabled = true) {
	return useQuery({
		queryKey: statusKey(postId),
		queryFn: () => bookmarksService.check(postId),
		enabled: enabled && postId > 0,
		staleTime: 60_000,
	});
}

export function useBookmarkCount(
	postId: number,
	initialData?: number | null,
	enabled = true,
) {
	return useQuery({
		queryKey: countKey(postId),
		queryFn: () => bookmarksService.getCount(postId),
		enabled: enabled && postId > 0,
		initialData: initialData ?? undefined,
		staleTime: 60_000,
	});
}

export function useBookmarkToggle(postId: number) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (currentlyBookmarked: boolean) => {
			if (currentlyBookmarked) {
				await bookmarksService.remove(postId);
				return false;
			}
			await bookmarksService.add(postId);
			return true;
		},
		onMutate: async (currentlyBookmarked) => {
			const statusQuery = { queryKey: statusKey(postId) };
			const countQuery = { queryKey: countKey(postId) };

			await Promise.all([
				queryClient.cancelQueries(statusQuery),
				queryClient.cancelQueries(countQuery),
			]);

			const previousStatus = queryClient.getQueryData<boolean>(
				statusQuery.queryKey,
			);
			const previousCount = queryClient.getQueryData<number>(
				countQuery.queryKey,
			);

			const nextStatus = !currentlyBookmarked;
			queryClient.setQueryData(statusQuery.queryKey, nextStatus);
			if (typeof previousCount === "number") {
				queryClient.setQueryData(
					countQuery.queryKey,
					previousCount + (nextStatus ? 1 : -1),
				);
			}

			return { previousStatus, previousCount };
		},
		onError: (_err, _vars, context) => {
			if (!context) return;
			if (typeof context.previousStatus !== "undefined") {
				queryClient.setQueryData(statusKey(postId), context.previousStatus);
			}
			if (typeof context.previousCount !== "undefined") {
				queryClient.setQueryData(countKey(postId), context.previousCount);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: listKey() });
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: statusKey(postId) });
			queryClient.invalidateQueries({ queryKey: countKey(postId) });
		},
	});
}

export function useBookmarks(params: Omit<GetBookmarksParams, "page"> = {}) {
	return useInfiniteQuery({
		queryKey: listKey(params),
		queryFn: ({ pageParam = 0 }) =>
			bookmarksService.list({ ...params, page: pageParam }),
		getNextPageParam: (lastPage) =>
			lastPage.last ? undefined : lastPage.number + 1,
		initialPageParam: 0,
	});
}
