import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useFollowCounts } from "../../hooks/useFollows";

interface FollowStatsProps {
	userId: number;
	className?: string;
}

export default function FollowStats({ userId, className }: FollowStatsProps) {
	const { data: counts, isLoading } = useFollowCounts(userId);

	if (isLoading) {
		return (
			<div className={cn("flex items-center gap-3 text-sm", className)}>
				<span className="text-muted-foreground">加载中...</span>
			</div>
		);
	}

	const followerCount = counts?.followerCount ?? 0;
	const followingCount = counts?.followingCount ?? 0;

	return (
		<div className={cn("flex items-center gap-3 text-sm", className)}>
			<Link
				to="/users/$userId/followers"
				params={{ userId: String(userId) }}
				className="hover:underline"
			>
				<span className="font-semibold">{followerCount}</span>{" "}
				<span className="text-muted-foreground">粉丝</span>
			</Link>
			<span className="text-muted-foreground/60">·</span>
			<Link
				to="/users/$userId/following"
				params={{ userId: String(userId) }}
				className="hover:underline"
			>
				<span className="font-semibold">{followingCount}</span>{" "}
				<span className="text-muted-foreground">关注</span>
			</Link>
		</div>
	);
}
