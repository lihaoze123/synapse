import {
	type InfiniteData,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	type CommentsPage,
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
		onSuccess: (newComment, variables) => {
			const queryKey = ["comments", variables.postId];

			queryClient.setQueryData<InfiniteData<CommentsPage>>(
				queryKey,
				(oldData) => {
					if (!oldData) return oldData;

					const newPages = oldData.pages.map((page, index) => {
						if (index === oldData.pages.length - 1) {
							return {
								...page,
								content: [...page.content, newComment],
								totalElements: page.totalElements + 1,
							};
						}
						return page;
					});

					return {
						...oldData,
						pages: newPages,
					};
				},
			);

			queryClient.invalidateQueries({ queryKey });
		},
	});
}

export function useUpdateComment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateCommentRequest }) =>
			commentsService.updateComment(id, data),
		onMutate: async ({ id, data }) => {
			await queryClient.cancelQueries({ queryKey: ["comments"] });

			const queriesData = queryClient.getQueriesData<
				InfiniteData<CommentsPage>
			>({ queryKey: ["comments"] });

			for (const [queryKey, oldData] of queriesData) {
				if (!oldData) continue;

				queryClient.setQueryData<InfiniteData<CommentsPage>>(
					queryKey,
					(old) => {
						if (!old) return old;
						return {
							...old,
							pages: old.pages.map((page) => ({
								...page,
								content: page.content.map((comment) =>
									comment.id === id
										? { ...comment, content: data.content }
										: comment,
								),
							})),
						};
					},
				);
			}

			return { queriesData };
		},
		onError: (_, __, context) => {
			if (context?.queriesData) {
				for (const [queryKey, data] of context.queriesData) {
					queryClient.setQueryData(queryKey, data);
				}
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["comments"] });
		},
	});
}

export function useDeleteComment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: number; postId: number }) =>
			commentsService.deleteComment(id),
		onMutate: async ({ id }) => {
			await queryClient.cancelQueries({ queryKey: ["comments"] });

			const queriesData = queryClient.getQueriesData<
				InfiniteData<CommentsPage>
			>({ queryKey: ["comments"] });

			for (const [queryKey, oldData] of queriesData) {
				if (!oldData) continue;

				queryClient.setQueryData<InfiniteData<CommentsPage>>(
					queryKey,
					(old) => {
						if (!old) return old;
						return {
							...old,
							pages: old.pages.map((page) => ({
								...page,
								content: page.content.map((comment) =>
									comment.id === id
										? { ...comment, content: "该评论已删除", isDeleted: true }
										: comment,
								),
							})),
						};
					},
				);
			}

			return { queriesData };
		},
		onError: (_, __, context) => {
			if (context?.queriesData) {
				for (const [queryKey, data] of context.queriesData) {
					queryClient.setQueryData(queryKey, data);
				}
			}
		},
		onSettled: (_, __, variables) => {
			queryClient.invalidateQueries({
				queryKey: ["comments", variables.postId],
			});
		},
	});
}
