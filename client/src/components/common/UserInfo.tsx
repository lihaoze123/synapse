import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserInfoProps {
	userId: number;
	username: string;
	avatarUrl?: string | null;
	timestamp?: string;
	size?: "sm" | "md";
	className?: string;
}

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

export default function UserInfo({
	userId,
	username,
	avatarUrl,
	timestamp,
	size = "md",
	className,
}: UserInfoProps) {
	const avatarSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";

	return (
		<Link
			to="/users/$userId"
			params={{ userId: String(userId) }}
			className={cn("flex items-center gap-1.5", className)}
			onClick={(e) => e.stopPropagation()}
		>
			<Avatar className={avatarSize}>
				<AvatarImage src={avatarUrl || undefined} alt={username} />
				<AvatarFallback className="text-xs font-medium">
					{username.slice(0, 2).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<div className="flex items-center gap-1">
				<span className="font-medium text-sm">{username}</span>
				{timestamp && (
					<>
						<span className="text-muted-foreground/50">·</span>
						<span className="text-muted-foreground text-xs">
							{formatRelativeTime(timestamp)}
						</span>
					</>
				)}
			</div>
		</Link>
	);
}
