import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserInfoProps {
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
	username,
	avatarUrl,
	timestamp,
	size = "md",
	className,
}: UserInfoProps) {
	const avatarSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";
	const textSize = size === "sm" ? "text-xs" : "text-sm";

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<Avatar className={avatarSize}>
				<AvatarImage src={avatarUrl || undefined} alt={username} />
				<AvatarFallback className={size === "sm" ? "text-xs" : "text-sm"}>
					{username.slice(0, 2).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<div className="flex items-center gap-1.5">
				<span className={cn("font-medium", textSize)}>{username}</span>
				{timestamp && (
					<>
						<span className="text-muted-foreground">·</span>
						<span className={cn("text-muted-foreground", textSize)}>
							{formatRelativeTime(timestamp)}
						</span>
					</>
				)}
			</div>
		</div>
	);
}
