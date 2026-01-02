import { Link } from "@tanstack/react-router";
import { useMarkAsRead, useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

interface NotificationDropdownProps {
	onClose?: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
	const { data, isLoading } = useNotifications({ size: 5 });
	const markAsRead = useMarkAsRead();

	const notifications = data?.pages.flatMap((page) => page.content) ?? [];

	const handleItemClick = (notificationId: number, isRead: boolean) => {
		if (!isRead) {
			markAsRead.mutate(notificationId);
		}
		onClose?.();
	};

	if (isLoading) {
		return (
			<div className="p-4 text-center text-sm text-muted-foreground">
				加载中...
			</div>
		);
	}

	if (notifications.length === 0) {
		return (
			<div className="p-4 text-center text-sm text-muted-foreground">
				暂无通知
			</div>
		);
	}

	return (
		<div className="max-h-[400px] overflow-y-auto">
			<div className="divide-y">
				{notifications.map((notification) => (
					<NotificationItem
						key={notification.id}
						notification={notification}
						onClick={() =>
							handleItemClick(notification.id, notification.isRead)
						}
					/>
				))}
			</div>
			<div className="p-2 border-t">
				<Link
					to="/notifications"
					onClick={onClose}
					className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					查看全部
				</Link>
			</div>
		</div>
	);
}
