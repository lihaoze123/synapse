import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";

interface NotificationItemProps {
	notification: Notification;
	onClick?: () => void;
}

const NOTIFICATION_MESSAGES: Record<Notification["type"], string> = {
	LIKE: "点赞了你的帖子",
	COMMENT: "评论了你的帖子",
	FOLLOW: "关注了你",
	MENTION: "在评论中提到了你",
};

function formatRelativeTime(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffSec < 60) return "刚刚";
	if (diffMin < 60) return `${diffMin} 分钟前`;
	if (diffHour < 24) return `${diffHour} 小时前`;
	if (diffDay < 7) return `${diffDay} 天前`;

	return date.toLocaleDateString("zh-CN", {
		month: "short",
		day: "numeric",
	});
}

function getNotificationLink(notification: Notification): string {
	if (notification.type === "FOLLOW") {
		return `/users/${notification.actor.id}`;
	}
	if (notification.post) {
		return `/posts/${notification.post.id}`;
	}
	return "/notifications";
}

export function NotificationItem({
	notification,
	onClick,
}: NotificationItemProps) {
	const displayLabel =
		notification.actor.displayName || notification.actor.username;

	return (
		<Link
			to={getNotificationLink(notification)}
			onClick={onClick}
			className={cn(
				"flex gap-3 p-3 hover:bg-muted/50 transition-colors",
				!notification.isRead && "bg-amber-50 dark:bg-amber-950/20",
			)}
		>
			<Avatar className="h-10 w-10 shrink-0">
				<AvatarImage
					src={notification.actor.avatarUrl || undefined}
					alt={displayLabel}
				/>
				<AvatarFallback className="text-sm font-medium">
					{displayLabel.slice(0, 2).toUpperCase()}
				</AvatarFallback>
			</Avatar>

			<div className="flex-1 min-w-0">
				<p className="text-sm">
					<span className="font-medium">{displayLabel}</span>{" "}
					{NOTIFICATION_MESSAGES[notification.type]}
				</p>
				{notification.post && (
					<p className="text-sm text-muted-foreground truncate mt-0.5">
						{notification.post.title || "动态"}
					</p>
				)}
				<time className="text-xs text-muted-foreground">
					{formatRelativeTime(notification.createdAt)}
				</time>
			</div>

			{!notification.isRead && (
				<div className="shrink-0 self-center">
					<div className="h-2 w-2 rounded-full bg-amber-500" />
				</div>
			)}
		</Link>
	);
}
