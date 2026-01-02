import { useCallback, useEffect, useRef } from "react";
import { useMarkAsRead, useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

export function NotificationList() {
	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useNotifications();
	const markAsRead = useMarkAsRead();
	const observerRef = useRef<IntersectionObserver | null>(null);

	const lastItemRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (isFetchingNextPage) return;
			if (observerRef.current) observerRef.current.disconnect();

			observerRef.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasNextPage) {
					fetchNextPage();
				}
			});

			if (node) observerRef.current.observe(node);
		},
		[isFetchingNextPage, hasNextPage, fetchNextPage],
	);

	useEffect(() => {
		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, []);

	const notifications = data?.pages.flatMap((page) => page.content) ?? [];

	const handleItemClick = (notificationId: number, isRead: boolean) => {
		if (!isRead) {
			markAsRead.mutate(notificationId);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4 p-4">
				{[1, 2, 3, 4, 5].map((i) => (
					<div key={i} className="flex gap-3 animate-pulse">
						<div className="h-10 w-10 rounded-full bg-muted" />
						<div className="flex-1 space-y-2">
							<div className="h-4 w-3/4 bg-muted rounded" />
							<div className="h-3 w-1/2 bg-muted rounded" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (notifications.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
				<p>暂无通知</p>
			</div>
		);
	}

	return (
		<div className="divide-y">
			{notifications.map((notification, index) => (
				<div
					key={notification.id}
					ref={index === notifications.length - 1 ? lastItemRef : undefined}
				>
					<NotificationItem
						notification={notification}
						onClick={() =>
							handleItemClick(notification.id, notification.isRead)
						}
					/>
				</div>
			))}
			{isFetchingNextPage && (
				<div className="p-4 text-center text-sm text-muted-foreground">
					加载中...
				</div>
			)}
		</div>
	);
}
