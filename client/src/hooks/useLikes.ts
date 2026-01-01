import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likesService } from "@/services/likes";

export function useLikePost(
	postId: number,
	_opts?: { initialCount?: number; initialLiked?: boolean },
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			return likesService.togglePost(postId);
		},
		onMutate: async () => {
			// no global cache keys yet; component handles optimistic UI
		},
		onSuccess: () => {
			// Invalidate post detail and lists so counts refresh eventually
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
