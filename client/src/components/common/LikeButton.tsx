import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { useLikeComment, useLikePost } from "@/hooks/useLikes";
import { cn } from "@/lib/utils";

const heartVariants = {
	initial: { scale: 1 },
	liked: {
		scale: [1, 1.3, 0.9, 1.1, 1],
		transition: {
			duration: 0.4,
			times: [0, 0.2, 0.4, 0.7, 1],
			ease: "easeOut" as const,
		},
	},
	unliked: {
		scale: [1, 0.8, 1],
		transition: { duration: 0.2 },
	},
};

interface LikeButtonProps {
	targetId: number;
	type: "post" | "comment";
	initialLiked: boolean;
	initialCount: number;
	className?: string;
	size?: "sm" | "md";
	appearance?: "default" | "fab";
}

export function LikeButton({
	targetId,
	type,
	initialLiked,
	initialCount,
	className,
	size = "sm",
	appearance = "default",
}: LikeButtonProps) {
	const { user } = useAuth();
	const isLoggedIn = Boolean(user);
	const [liked, setLiked] = useState<boolean>(initialLiked);
	const [count, setCount] = useState<number>(initialCount);

	const likePost = useLikePost(type === "post" ? targetId : 0);
	const likeComment = useLikeComment(type === "comment" ? targetId : 0);
	const isWorking = likePost.isPending || likeComment.isPending;

	const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isLoggedIn) {
			toast.error("请先登录再点赞");
			return;
		}
		// optimistic update
		const nextLiked = !liked;
		setLiked(nextLiked);
		setCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));

		const action =
			type === "post" ? likePost.mutateAsync : likeComment.mutateAsync;
		action()
			.then((res) => {
				setLiked(res.liked);
				setCount(res.count);
			})
			.catch((_err) => {
				// rollback
				setLiked(!nextLiked);
				setCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
			});
	};

	const buttonSize = size === "sm" ? "xs" : "default";

	if (appearance === "fab") {
		return (
			<motion.button
				type="button"
				onClick={handleToggle}
				disabled={isWorking}
				aria-pressed={liked}
				aria-busy={isWorking}
				whileTap={{ scale: 0.9 }}
				whileHover={{ scale: 1.05 }}
				className={cn(
					"relative h-11 w-11 rounded-full border flex items-center justify-center shadow-sm transition-colors",
					liked
						? "border-rose-300 bg-rose-50 text-rose-700"
						: "border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200",
					className,
				)}
			>
				{isWorking ? (
					<Loader2 className="h-5 w-5 animate-spin" />
				) : (
					<motion.div
						animate={liked ? "liked" : "unliked"}
						variants={heartVariants}
					>
						<Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
					</motion.div>
				)}
				{count > 0 && (
					<motion.span
						key={count}
						initial={{ scale: 0.5, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="absolute -top-1 -right-1 rounded-full bg-rose-500 text-white text-[10px] leading-none px-1.5 py-0.5"
					>
						{count > 999 ? "999+" : count}
					</motion.span>
				)}
			</motion.button>
		);
	}

	// Default inline button with text count
	return (
		<Button
			size={buttonSize}
			variant={liked ? "secondary" : "outline"}
			onClick={handleToggle}
			disabled={isWorking}
			aria-pressed={liked}
			aria-busy={isWorking}
			className={cn(
				liked && "border-rose-200 bg-rose-50 text-rose-700",
				"gap-1 active:scale-95 transition-transform",
				className,
			)}
		>
			{isWorking ? (
				<Loader2 className="h-3.5 w-3.5 animate-spin" />
			) : (
				<motion.div
					animate={liked ? "liked" : "unliked"}
					variants={heartVariants}
				>
					<Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
				</motion.div>
			)}
			<span className="tabular-nums text-xs text-foreground/80">{count}</span>
		</Button>
	);
}
