import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	type CreatePostRequest,
	type GetPostsParams,
	postsService,
} from "../services/posts";
import type { PostType } from "../types";

export function usePosts(params: Omit<GetPostsParams, "page"> = {}) {
	return useInfiniteQuery({
		queryKey: ["posts", params],
		queryFn: ({ pageParam = 0 }) =>
			postsService.getPosts({ ...params, page: pageParam }),
		getNextPageParam: (lastPage) =>
			lastPage.last ? undefined : lastPage.number + 1,
		initialPageParam: 0,
	});
}

export function usePost(id: number) {
	return useQuery({
		queryKey: ["post", id],
		queryFn: () => postsService.getPost(id),
		enabled: id > 0,
	});
}

export function useCreatePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreatePostRequest) => postsService.createPost(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["tags"] });
		},
	});
}

export function useUpdatePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: CreatePostRequest }) =>
			postsService.updatePost(id, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["post", variables.id] });
			queryClient.invalidateQueries({ queryKey: ["tags"] });
		},
	});
}

export function useDeletePost() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => postsService.deletePost(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["tags"] });
		},
	});
}

export function useFilteredPosts(tag?: string, type?: PostType) {
	return usePosts({ tag, type });
}
