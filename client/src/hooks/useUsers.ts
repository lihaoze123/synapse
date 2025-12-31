import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { type UpdateProfileRequest, userService } from "../services/users";

export function useUserPosts(userId: number) {
	return useInfiniteQuery({
		queryKey: ["userPosts", userId],
		queryFn: ({ pageParam = 0 }) => userService.getUserPosts(userId, pageParam),
		getNextPageParam: (lastPage) =>
			lastPage.last ? undefined : lastPage.number + 1,
		initialPageParam: 0,
		enabled: userId > 0,
	});
}

export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
		onSuccess: (updatedUser) => {
			localStorage.setItem("user", JSON.stringify(updatedUser));
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			queryClient.invalidateQueries({ queryKey: ["user"] });
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: ["userPosts"] });
		},
	});
}
