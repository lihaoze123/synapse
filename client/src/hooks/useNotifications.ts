import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	type GetNotificationsParams,
	notificationsService,
} from "../services/notifications";

const unreadCountKey = ["notifications", "unread-count"];
const listKey = (params: Omit<GetNotificationsParams, "page"> = {}) => [
	"notifications",
	"list",
	params,
];

export function useUnreadCount(options?: { refetchInterval?: number }) {
	return useQuery({
		queryKey: unreadCountKey,
		queryFn: () => notificationsService.getUnreadCount(),
		staleTime: 30_000,
		refetchInterval: options?.refetchInterval,
	});
}

export function useNotifications(
	params: Omit<GetNotificationsParams, "page"> = {},
) {
	return useInfiniteQuery({
		queryKey: listKey(params),
		queryFn: ({ pageParam = 0 }) =>
			notificationsService.list({ ...params, page: pageParam }),
		getNextPageParam: (lastPage) =>
			lastPage.last ? undefined : lastPage.number + 1,
		initialPageParam: 0,
	});
}

export function useMarkAsRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => notificationsService.markAsRead(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: unreadCountKey });
			queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
		},
	});
}

export function useMarkAllAsRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => notificationsService.markAllAsRead(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: unreadCountKey });
			queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
		},
	});
}
