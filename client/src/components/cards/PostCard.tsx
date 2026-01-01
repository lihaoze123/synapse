import { Link, useNavigate } from "@tanstack/react-router";
import { Code, FileText, MessageCircle } from "lucide-react";
import { UserInfo } from "@/components/common";
import { BookmarkButton } from "@/components/common/BookmarkButton";
import FollowButton from "@/components/common/FollowButton";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";
import ArticleContent from "./ArticleContent";
import MomentContent from "./MomentContent";
import SnippetContent from "./SnippetContent";

interface PostCardProps {
	post: Post;
	className?: string;
}

const TYPE_CONFIG = {
	SNIPPET: {
		icon: Code,
		color: "text-blue-600",
		label: "代码片段",
	},
	ARTICLE: {
		icon: FileText,
		color: "text-green-600",
		label: "文章",
	},
	MOMENT: {
		icon: MessageCircle,
		color: "text-amber-600",
		label: "动态",
	},
} as const;

export default function PostCard({ post, className }: PostCardProps) {
	const config = TYPE_CONFIG[post.type];
	const TypeIcon = config.icon;
	const navigate = useNavigate();
	const { user: currentUser } = useAuth();

	const isMe = currentUser?.id === post.user.id;
	const showFollowButton = !isMe;

	const handleTagClick = (e: React.MouseEvent, tagName: string) => {
		e.preventDefault();
		e.stopPropagation();
		navigate({ to: "/", search: { tag: tagName } });
	};

	return (
		<Link to="/posts/$id" params={{ id: String(post.id) }} className="block">
			<Card className={cn("p-4 cursor-pointer", className)}>
				<div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
					<div className="flex items-center gap-2 min-w-0">
						<UserInfo
							userId={post.user.id}
							username={post.user.username}
							avatarUrl={post.user.avatarUrl}
							timestamp={post.createdAt}
							asLink={false}
						/>
						{showFollowButton && (
							<FollowButton userId={post.user.id} size="sm" />
						)}
					</div>
					<div className="flex items-center gap-2 mt-2 sm:mt-0">
						<BookmarkButton postId={post.id} size="sm" />
						<div
							className={cn(
								"flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
								"bg-gray-100 dark:bg-gray-800",
								config.color,
							)}
							title={config.label}
						>
							<TypeIcon className="h-3 w-3" />
							<span className="hidden sm:inline">{config.label}</span>
						</div>
					</div>
				</div>

				<div className="mb-3">
					{post.type === "SNIPPET" && (
						<SnippetContent
							title={post.title}
							content={post.content}
							language={post.language}
						/>
					)}
					{post.type === "ARTICLE" && (
						<ArticleContent
							title={post.title || "无标题"}
							summary={post.summary}
							coverImage={post.coverImage}
						/>
					)}
					{post.type === "MOMENT" && (
						<MomentContent content={post.content} images={post.images} />
					)}
				</div>

				{post.tags && post.tags.length > 0 && (
					<div className="flex flex-wrap gap-1.5">
						{post.tags.map((tag) => (
							<button
								key={tag.id}
								type="button"
								onClick={(e) => handleTagClick(e, tag.name)}
								className={cn(
									"inline-flex items-center gap-0.5 px-2 py-0.5 rounded",
									"bg-gray-100 dark:bg-gray-800 text-muted-foreground text-xs",
									"hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-foreground",
									"transition-colors duration-150",
								)}
							>
								<span className="opacity-50">#</span>
								<span>{tag.name}</span>
							</button>
						))}
					</div>
				)}
			</Card>
		</Link>
	);
}
