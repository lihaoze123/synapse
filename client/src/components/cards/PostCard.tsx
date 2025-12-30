import { Link, useNavigate } from "@tanstack/react-router";
import { Code, FileText, MessageCircle } from "lucide-react";
import { UserInfo } from "@/components/common";
import { Card } from "@/components/ui/card";
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

	const handleTagClick = (e: React.MouseEvent, tagName: string) => {
		e.preventDefault();
		e.stopPropagation();
		navigate({ to: "/", search: { tag: tagName } });
	};

	return (
		<Link to="/posts/$id" params={{ id: String(post.id) }} className="block">
			<Card
				className={cn(
					"p-5 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
					"hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] hover:-translate-y-0.5",
					"cursor-pointer group",
					className,
				)}
			>
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<UserInfo
						username={post.user.username}
						avatarUrl={post.user.avatarUrl}
						timestamp={post.createdAt}
					/>
					<div
						className={cn(
							"flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
							"bg-secondary/80 transition-colors",
							config.color,
						)}
						title={config.label}
					>
						<TypeIcon className="h-3.5 w-3.5" />
						<span className="hidden sm:inline">{config.label}</span>
					</div>
				</div>

				{/* Content - varies by type */}
				<div className="mb-4">
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
					{post.type === "MOMENT" && <MomentContent content={post.content} />}
				</div>

				{/* Tags */}
				{post.tags && post.tags.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{post.tags.map((tag) => (
							<button
								key={tag.id}
								type="button"
								onClick={(e) => handleTagClick(e, tag.name)}
								className={cn(
									"inline-flex items-center gap-1 px-2.5 py-1 rounded-md",
									"bg-secondary/60 text-muted-foreground text-xs font-medium",
									"hover:bg-primary hover:text-primary-foreground",
									"transition-colors duration-150",
								)}
							>
								<span className="opacity-60">#</span>
								<span>{tag.name}</span>
							</button>
						))}
					</div>
				)}
			</Card>
		</Link>
	);
}
