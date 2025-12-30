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
		<Link to="/posts/$id" params={{ id: String(post.id) }}>
			<Card
				className={cn(
					"p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
					className,
				)}
			>
				{/* Header */}
				<div className="flex items-center justify-between mb-3">
					<UserInfo
						username={post.user.username}
						avatarUrl={post.user.avatarUrl}
						timestamp={post.createdAt}
					/>
					<div className="flex items-center gap-1.5" title={config.label}>
						<TypeIcon className={cn("h-4 w-4", config.color)} />
					</div>
				</div>

				{/* Content - varies by type */}
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
					{post.type === "MOMENT" && <MomentContent content={post.content} />}
				</div>

				{/* Tags */}
				{post.tags && post.tags.length > 0 && (
					<div className="flex flex-wrap gap-1.5">
						{post.tags.map((tag) => (
							<button
								key={tag.id}
								type="button"
								onClick={(e) => handleTagClick(e, tag.name)}
								className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-xs hover:bg-secondary/80 transition-colors"
							>
								<span>#</span>
								<span>{tag.name}</span>
							</button>
						))}
					</div>
				)}
			</Card>
		</Link>
	);
}
