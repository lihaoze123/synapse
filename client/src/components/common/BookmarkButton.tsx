import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import {
	useBookmarkCount,
	useBookmarkStatus,
	useBookmarkToggle,
} from "@/hooks/useBookmarks";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
	postId: number;
	className?: string;
	showCount?: boolean;
	initialCount?: number | null;
	size?: "sm" | "md";
}

export function BookmarkButton({
	postId,
	className,
	showCount = true,
	initialCount = null,
	size = "sm",
}: BookmarkButtonProps) {
	const { user } = useAuth();
	const isLoggedIn = Boolean(user);
	const { data: isBookmarked = false, isFetching: statusLoading } =
		useBookmarkStatus(postId, isLoggedIn);
	const { data: count, isFetching: countLoading } = useBookmarkCount(
		postId,
		initialCount,
		true,
	);
	const toggle = useBookmarkToggle(postId);
	const isWorking = toggle.isPending || statusLoading;

	const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		event.stopPropagation();

		if (!user) {
			toast.error("请先登录再收藏");
			return;
		}

		toggle.mutate(isBookmarked);
	};

	// Normalize to Button sizes so that 'md' aligns with default h-9 buttons
	const buttonSize = size === "sm" ? "xs" : "default";

	return (
		<Button
			size={buttonSize}
			variant={isBookmarked ? "secondary" : "outline"}
			onClick={handleToggle}
			disabled={isWorking}
			aria-pressed={isBookmarked}
			aria-busy={isWorking}
			className={cn(
				isBookmarked && "border-amber-200 bg-amber-50 text-amber-700",
				className,
			)}
		>
			{isWorking ? (
				<Loader2 className="h-3.5 w-3.5 animate-spin" />
			) : (
				<Bookmark
					className="h-4 w-4"
					fill={isBookmarked ? "currentColor" : "none"}
				/>
			)}
			{showCount && (
				<span className="tabular-nums text-xs text-foreground/80">
					{countLoading && typeof count !== "number" ? "..." : (count ?? "—")}
				</span>
			)}
		</Button>
	);
}
