import { ArrowUp, Bookmark, MoreVertical, Share2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { LikeButton } from "@/components/common/LikeButton";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import { useAuth } from "@/hooks";
import {
	useBookmarkCount,
	useBookmarkStatus,
	useBookmarkToggle,
} from "@/hooks/useBookmarks";
import { cn } from "@/lib/utils";

interface MobileActionBarProps {
	postId: number;
	isAuthor?: boolean;
	onEdit?: () => void;
	onDelete?: () => void;
	initialLiked?: boolean;
	initialLikeCount?: number;
}

// A lightweight bottom action bar for mobile: Bookmark, Comment, Share.
// On mobile it floats as a vertical FAB stack at bottom-right.
export function MobileActionBar({
	postId,
	isAuthor = false,
	onEdit,
	onDelete,
	initialLiked = false,
	initialLikeCount = 0,
}: MobileActionBarProps) {
	const { user } = useAuth();
	const isLoggedIn = Boolean(user);
	const { data: isBookmarked = false } = useBookmarkStatus(postId, isLoggedIn);
	const { data: count } = useBookmarkCount(postId, null, true);
	const toggle = useBookmarkToggle(postId);

	const displayCount = useMemo(() => {
		if (typeof count !== "number") return "0";
		if (count > 999) return "999+";
		return String(count);
	}, [count]);

	const onBookmark = () => {
		if (!isLoggedIn) {
			toast.error("请先登录再收藏");
			return;
		}
		toggle.mutate(isBookmarked);
	};

	const onShare = async () => {
		const url = window.location.href;
		try {
			if (navigator.share) {
				await navigator.share({ url });
			} else {
				await navigator.clipboard.writeText(url);
				toast.success("链接已复制");
			}
		} catch {
			/* no-op cancel */
		}
	};

	const onBackToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div
			className="fixed md:hidden z-30"
			style={{
				right: "1rem",
				bottom: "calc(env(safe-area-inset-bottom) + 56px + 1rem)",
			}}
		>
			<div className="flex flex-col items-center gap-3">
				<LikeButton
					targetId={postId}
					type="post"
					initialLiked={initialLiked}
					initialCount={initialLikeCount}
					size="md"
					appearance="fab"
				/>
				<button
					type="button"
					onClick={onBookmark}
					aria-pressed={isBookmarked}
					aria-label={isBookmarked ? "取消收藏" : "收藏"}
					className={cn(
						"relative h-11 w-11 rounded-full border flex items-center justify-center shadow-sm",
						isBookmarked
							? "border-amber-300 bg-amber-50 text-amber-700"
							: "border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",
					)}
				>
					<Bookmark
						className="h-5 w-5"
						fill={isBookmarked ? "currentColor" : "none"}
					/>
					{displayCount !== "0" && (
						<span className="absolute -top-1 -right-1 rounded-full bg-amber-500 text-white text-[10px] leading-none px-1.5 py-0.5">
							{displayCount}
						</span>
					)}
				</button>
				<button
					type="button"
					onClick={onBackToTop}
					aria-label="返回顶部"
					className="h-11 w-11 rounded-full border flex items-center justify-center shadow-sm border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
				>
					<ArrowUp className="h-5 w-5" />
				</button>
				{isAuthor ? (
					<Menu>
						<MenuTrigger>
							<button
								type="button"
								aria-label="更多"
								className="h-11 w-11 rounded-full border flex items-center justify-center shadow-sm border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
							>
								<MoreVertical className="h-5 w-5" />
							</button>
						</MenuTrigger>
						<MenuPopup align="end" sideOffset={6}>
							{onEdit && <MenuItem onClick={onEdit}>编辑</MenuItem>}
							{onDelete && (
								<MenuItem data-variant="destructive" onClick={onDelete}>
									删除
								</MenuItem>
							)}
						</MenuPopup>
					</Menu>
				) : (
					<button
						type="button"
						onClick={onShare}
						aria-label="分享"
						className="h-11 w-11 rounded-full border flex items-center justify-center shadow-sm border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
					>
						<Share2 className="h-5 w-5" />
					</button>
				)}
			</div>
		</div>
	);
}
