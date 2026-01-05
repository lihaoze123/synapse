import { motion } from "framer-motion";
import {
	Bell,
	Bookmark,
	FileText,
	Inbox,
	MessageSquare,
	Search,
	Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateVariant =
	| "posts"
	| "comments"
	| "notifications"
	| "bookmarks"
	| "search"
	| "followers"
	| "following"
	| "default";

interface IllustratedEmptyStateProps {
	variant?: EmptyStateVariant;
	title?: string;
	description?: string;
	className?: string;
	action?: ReactNode;
}

const pulseAnimation = {
	initial: { scale: 1, opacity: 0.5 },
	animate: {
		scale: [1, 1.1, 1],
		opacity: [0.5, 0.8, 0.5],
		transition: {
			duration: 2,
			repeat: Number.POSITIVE_INFINITY,
			ease: "easeInOut" as const,
		},
	},
};

const variantConfig: Record<
	EmptyStateVariant,
	{
		icon: typeof Inbox;
		title: string;
		description: string;
		color: string;
		bgColor: string;
	}
> = {
	posts: {
		icon: FileText,
		title: "暂无内容",
		description: "成为第一个分享的人吧！",
		color: "text-blue-500",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	comments: {
		icon: MessageSquare,
		title: "暂无评论",
		description: "快来发表你的看法吧！",
		color: "text-emerald-500",
		bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
	},
	notifications: {
		icon: Bell,
		title: "暂无通知",
		description: "新的互动消息会显示在这里",
		color: "text-amber-500",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
	},
	bookmarks: {
		icon: Bookmark,
		title: "暂无收藏",
		description: "收藏喜欢的内容，方便稍后查看",
		color: "text-rose-500",
		bgColor: "bg-rose-100 dark:bg-rose-900/30",
	},
	search: {
		icon: Search,
		title: "未找到结果",
		description: "尝试使用不同的关键词搜索",
		color: "text-purple-500",
		bgColor: "bg-purple-100 dark:bg-purple-900/30",
	},
	followers: {
		icon: Users,
		title: "暂无粉丝",
		description: "分享更多内容来吸引关注者",
		color: "text-cyan-500",
		bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
	},
	following: {
		icon: Users,
		title: "暂未关注",
		description: "关注感兴趣的用户，发现更多内容",
		color: "text-indigo-500",
		bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
	},
	default: {
		icon: Inbox,
		title: "暂无内容",
		description: "这里空空如也",
		color: "text-gray-500",
		bgColor: "bg-gray-100 dark:bg-gray-800",
	},
};

export function IllustratedEmptyState({
	variant = "default",
	title,
	description,
	className,
	action,
}: IllustratedEmptyStateProps) {
	const config = variantConfig[variant];
	const Icon = config.icon;

	return (
		<Card className={cn("py-12 text-center overflow-hidden", className)}>
			<motion.div
				initial="initial"
				animate="animate"
				className="flex flex-col items-center gap-4"
			>
				<div className="relative">
					<motion.div
						variants={pulseAnimation}
						className={cn(
							"absolute inset-0 rounded-full blur-xl",
							config.bgColor,
						)}
						style={{
							width: "80px",
							height: "80px",
							left: "-8px",
							top: "-8px",
							willChange: "transform, opacity",
						}}
					/>
					<div
						className={cn(
							"relative flex h-16 w-16 items-center justify-center rounded-full",
							config.bgColor,
						)}
					>
						<Icon className={cn("h-8 w-8", config.color)} />
					</div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="space-y-2"
					style={{ willChange: "transform, opacity" }}
				>
					<h3 className="text-lg font-semibold text-foreground">
						{title ?? config.title}
					</h3>
					<p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
						{description ?? config.description}
					</p>
				</motion.div>

				{action && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						style={{ willChange: "transform, opacity" }}
					>
						{action}
					</motion.div>
				)}
			</motion.div>
		</Card>
	);
}
