import {
	type InfiniteData,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { likesService } from "@/services/likes";
import type { Page, Post } from "@/types";

export function useLikePost(
	postId: number,
	_opts?: { initialCount?: number; initialLiked?: boolean },
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			return likesService.togglePost(postId);
		},
		onSuccess: (res) => {
			// Update post detail cache immediately
			queryClient.setQueryData(
				["post", postId],
				(existing: Post | undefined) => {
					if (!existing) return existing;
					return {
						...existing,
						likeCount: res.count,
						userState: { ...(existing.userState ?? {}), liked: res.liked },
					};
				},
			);

			// Update any cached posts lists where this post appears (infinite queries)
			const lists = queryClient.getQueriesData<InfiniteData<Page<Post>>>({
				queryKey: ["posts"],
			});
			for (const [key, data] of lists) {
				if (!data) continue;
				const updated = {
					...data,
					pages: data.pages.map((page) => ({
						...page,
						content: page.content.map((p) =>
							p.id === postId
								? {
										...p,
										likeCount: res.count,
										userState: { ...(p.userState ?? {}), liked: res.liked },
									}
								: p,
						),
					})),
				};
				queryClient.setQueryData(key, updated);
			}

			// Still invalidate to sync any other stale caches with server later
			queryClient.invalidateQueries({ queryKey: ["post", postId] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
	});
}

export function useLikeComment(commentId: number) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			return likesService.toggleComment(commentId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["comments"] });
		},
	});
}
