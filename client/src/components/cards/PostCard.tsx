import { Link, useNavigate } from "@tanstack/react-router";
import { Code, FileText, MessageCircle, Sparkles } from "lucide-react";
import AIPreviewModal from "@/components/ai/AIPreviewModal";
import { UserInfo } from "@/components/common";
import { AttachmentList } from "@/components/common/AttachmentList";
import { BookmarkButton } from "@/components/common/BookmarkButton";
import FollowButton from "@/components/common/FollowButton";
import { LikeButton } from "@/components/common/LikeButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAIPreview, useAuth } from "@/hooks";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";
import ArticleContent from "./ArticleContent";
import MomentContent from "./MomentContent";
import PrivateOverlay from "./PrivateOverlay";
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
	const { preview, generate, applySuggestion, closePreview, retry } =
		useAIPreview();

	const isMe = currentUser?.id === post.user.id;
	const showFollowButton = !isMe;

	const handleTagClick = (e: React.MouseEvent, tagName: string) => {
		e.preventDefault();
		e.stopPropagation();
		navigate({ to: "/", search: { tag: tagName } });
	};

	// Build AI source text: prefer full content; fallback to summary for articles
	const aiSourceContent = post.content?.trim() || post.summary?.trim() || "";
	const canAISummarize =
		!!aiSourceContent && !(post.isPrivate && !post.content);

	const handleAISummarize = (e: React.MouseEvent) => {
		// Prevent navigation when clicking inside the card link
		e.preventDefault();
		e.stopPropagation();
		if (!canAISummarize) return;
		generate("summarize", aiSourceContent, post.language || undefined);
	};

	return (
		<Link to="/posts/$id" params={{ id: String(post.id) }} className="block">
			<Card className={cn("p-4 cursor-pointer", className)}>
				<div className="flex items-start justify-between mb-3 gap-2 flex-wrap">
					<div className="flex items-center gap-2 min-w-0">
						<UserInfo
							userId={post.user.id}
							username={post.user.username}
							displayName={post.user.displayName}
							avatarUrl={post.user.avatarUrl}
							timestamp={post.createdAt}
							asLink={false}
						/>
						{showFollowButton && (
							<FollowButton userId={post.user.id} size="sm" />
						)}
					</div>
					<div className="flex items-center gap-2 mt-2 sm:mt-0">
						<LikeButton
							targetId={post.id}
							type="post"
							initialLiked={post.userState?.liked ?? false}
							initialCount={post.likeCount ?? 0}
							size="sm"
						/>
						<BookmarkButton postId={post.id} size="sm" />
						<div className="h-4 w-px bg-border" />
						<Button
							variant="ghost"
							size="sm"
							disabled={!canAISummarize}
							onClick={handleAISummarize}
							className="h-8 gap-1.5 px-2.5 text-xs font-medium text-muted-foreground hover:text-primary"
							title={canAISummarize ? "AI 摘要" : "暂无可用于摘要的内容"}
						>
							<Sparkles className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">AI 摘要</span>
						</Button>
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
					{post.isPrivate && !post.content ? (
						<PrivateOverlay />
					) : (
						<>
							{post.type === "SNIPPET" && (
								<SnippetContent
									title={post.title}
									content={post.content || ""}
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
								<MomentContent
									content={post.content || ""}
									images={post.images}
								/>
							)}
						</>
					)}
				</div>

				{post.attachments &&
					post.attachments.length > 0 &&
					!(post.isPrivate && !post.content) && (
						<AttachmentList attachments={post.attachments} className="mt-4" />
					)}

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

				{/* AI 预览模态：在卡片级别触发的 AI 摘要预览 */}
				<AIPreviewModal
					open={preview.isOpen}
					onOpenChange={(open) => (open ? null : closePreview())}
					action="summarize"
					originalContent={preview.originalContent}
					suggestion={preview.suggestion}
					isLoading={preview.isLoading}
					error={preview.error}
					// For cards, applying means quickly copying the suggestion
					onApply={() =>
						applySuggestion((s) => {
							// Copy to clipboard; do not modify card content
							navigator.clipboard?.writeText(s).catch(() => {
								/* ignore */
							});
						})
					}
					onRetry={retry}
				/>
			</Card>
		</Link>
	);
}
