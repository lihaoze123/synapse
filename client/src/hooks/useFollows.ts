import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { followsService } from "../services/follows";
import { useAuth } from "./useAuth";

export function useIsFollowing(userId: number) {
	const { isAuthenticated } = useAuth();
	const { data, isLoading } = useQuery({
		queryKey: ["isFollowing", userId],
		queryFn: () => followsService.checkFollowing(userId),
		enabled: isAuthenticated && userId > 0,
		staleTime: 2 * 60 * 1000,
	});

	return {
		isFollowing: data ?? false,
		isLoading,
	};
}

export function useFollowCounts(userId: number) {
	return useQuery({
		queryKey: ["followCounts", userId],
		queryFn: () => followsService.getFollowCounts(userId),
		enabled: userId > 0,
	});
}

export function useFollowers(userId: number) {
	return useInfiniteQuery({
		queryKey: ["followers", userId],
		queryFn: ({ pageParam = 0 }) =>
			followsService.getFollowers(userId, pageParam),
		getNextPageParam: (lastPage) =>
			lastPage.last ? undefined : lastPage.number + 1,
		initialPageParam: 0,
		enabled: userId > 0,
	});
}

export function useFollowing(userId: number) {
	return useInfiniteQuery({
		queryKey: ["following", userId],
		queryFn: ({ pageParam = 0 }) =>
			followsService.getFollowing(userId, pageParam),
		getNextPageParam: (lastPage) =>
			lastPage.last ? undefined : lastPage.number + 1,
		initialPageParam: 0,
		enabled: userId > 0,
	});
}

export function useFollowUser() {
	const queryClient = useQueryClient();
	const { user } = useAuth();

	return useMutation({
		mutationFn: (userId: number) => followsService.followUser(userId),
		onMutate: async (userId) => {
			await queryClient.cancelQueries({ queryKey: ["isFollowing", userId] });

			const previousValue = queryClient.getQueryData<boolean>([
				"isFollowing",
				userId,
			]);

			queryClient.setQueryData<boolean>(["isFollowing", userId], true);

			return { previousValue };
		},
		onError: (err, userId, context) => {
			queryClient.setQueryData(["isFollowing", userId], context?.previousValue);
			toast.error(err.message || "关注失败，请稍后重试");
		},
		onSettled: (_data, _error, userId) => {
			queryClient.invalidateQueries({ queryKey: ["isFollowing", userId] });
			queryClient.invalidateQueries({ queryKey: ["followCounts", userId] });
			if (user?.id) {
				queryClient.invalidateQueries({ queryKey: ["followCounts", user.id] });
			}
			queryClient.invalidateQueries({ queryKey: ["followers", userId] });
			if (user?.id) {
				queryClient.invalidateQueries({ queryKey: ["following", user.id] });
			}
		},
	});
}

export function useUnfollowUser() {
	const queryClient = useQueryClient();
	const { user } = useAuth();

	return useMutation({
		mutationFn: (userId: number) => followsService.unfollowUser(userId),
		onMutate: async (userId) => {
			await queryClient.cancelQueries({ queryKey: ["isFollowing", userId] });

			const previousValue = queryClient.getQueryData<boolean>([
				"isFollowing",
				userId,
			]);

			queryClient.setQueryData<boolean>(["isFollowing", userId], false);

			return { previousValue };
		},
		onError: (err, userId, context) => {
			queryClient.setQueryData(["isFollowing", userId], context?.previousValue);
			toast.error(err.message || "取消关注失败，请稍后重试");
		},
		onSettled: (_data, _error, userId) => {
			queryClient.invalidateQueries({ queryKey: ["isFollowing", userId] });
			queryClient.invalidateQueries({ queryKey: ["followCounts", userId] });
			if (user?.id) {
				queryClient.invalidateQueries({ queryKey: ["followCounts", user.id] });
			}
			queryClient.invalidateQueries({ queryKey: ["followers", userId] });
			if (user?.id) {
				queryClient.invalidateQueries({ queryKey: ["following", user.id] });
			}
		},
	});
}
