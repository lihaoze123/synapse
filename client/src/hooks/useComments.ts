import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	type CreateCommentRequest,
	commentsService,
	type UpdateCommentRequest,
} from "../services/comments";

const PAGE_SIZE = 20;

export function usePostComments(postId: number, enabled = true) {
	return useInfiniteQuery({
		queryKey: ["comments", postId],
		queryFn: ({ pageParam = 0 }) =>
			commentsService.getPostComments(postId, pageParam, PAGE_SIZE),
		getNextPageParam: (lastPage) => {
			return lastPage.last ? undefined : lastPage.number + 1;
		},
		enabled: enabled && postId > 0,
		initialPageParam: 0,
	});
}

export function useCreateComment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			postId,
			data,
		}: {
			postId: number;
			data: CreateCommentRequest;
		}) => commentsService.createComment(postId, data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["comments", variables.postId],
			});
		},
	});
}

export function useUpdateComment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateCommentRequest }) =>
			commentsService.updateComment(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["comments"] });
		},
	});
}

export function useDeleteComment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: number; postId: number }) =>
			commentsService.deleteComment(id),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["comments", variables.postId],
			});
		},
	});
}
