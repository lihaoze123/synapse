import { Link } from "@tanstack/react-router";
import { forwardRef, useEffect, useRef, useState } from "react";
import { LikeButton } from "@/components/common/LikeButton";
import MarkdownToolbar from "@/components/editor/MarkdownToolbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { useDeleteComment, useUpdateComment } from "@/hooks/useComments";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";
import CommentContent from "./CommentContent";

interface CommentItemProps {
	comment: Comment & { isPending?: boolean };
	postId: number;
	isHighlighted?: boolean;
	onReply?: (commentId: number, username: string, floor: number) => void;
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

const CommentItem = forwardRef<HTMLDivElement, CommentItemProps>(
	({ comment, postId, isHighlighted = false, onReply }, ref) => {
		const { user: currentUser } = useAuth();
		const [isEditing, setIsEditing] = useState(false);
		const [editContent, setEditContent] = useState(comment.content);
		const [showHighlight, setShowHighlight] = useState(isHighlighted);
		const textareaRef = useRef<HTMLTextAreaElement>(null);

		const updateComment = useUpdateComment();
		const deleteComment = useDeleteComment();

		const isAuthor = currentUser?.id === comment.user.id;
		const isDeleted = comment.isDeleted ?? false;
		const isPending = comment.isPending ?? false;
		const floor = comment.floor ?? 0;

		useEffect(() => {
			if (isHighlighted) {
				setShowHighlight(true);
				const timer = setTimeout(() => setShowHighlight(false), 2000);
				return () => clearTimeout(timer);
			}
		}, [isHighlighted]);

		useEffect(() => {
			if (isEditing && textareaRef.current) {
				textareaRef.current.focus();
				const len = comment.content.length;
				textareaRef.current.setSelectionRange(len, len);
			}
		}, [isEditing, comment.content.length]);

		const handleUpdate = () => {
			if (editContent.trim() && editContent !== comment.content) {
				updateComment.mutate(
					{ id: comment.id, data: { content: editContent } },
					{
						onSuccess: () => {
							setIsEditing(false);
						},
					},
				);
			} else {
				setIsEditing(false);
			}
		};

		const handleKeyDown = (e: React.KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				e.preventDefault();
				handleUpdate();
			}
			if (e.key === "Escape") {
				e.preventDefault();
				setIsEditing(false);
				setEditContent(comment.content);
			}
		};

		const handleDelete = () => {
			if (confirm("确定要删除这条评论吗？")) {
				deleteComment.mutate({ id: comment.id, postId });
			}
		};

		const handleReply = () => {
			if (onReply && !isDeleted && floor > 0) {
				onReply(comment.id, comment.user.username, floor);
			}
		};

		return (
			<div
				ref={ref}
				className={cn(
					"flex gap-3 transition-all duration-500 rounded-lg -mx-2 px-2 py-1",
					showHighlight && "bg-primary/10 animate-pulse",
					isPending && "opacity-60",
				)}
			>
				<div className="flex flex-col items-center gap-1 shrink-0">
					<Link
						to="/users/$userId"
						params={{ userId: String(comment.user.id) }}
						className="shrink-0"
					>
						<Avatar className="h-8 w-8 ring-2 ring-border/30 hover:ring-primary/50 transition-all">
							<AvatarImage
								src={comment.user.avatarUrl || undefined}
								alt={comment.user.username}
							/>
							<AvatarFallback className="text-xs font-medium">
								{comment.user.username.slice(0, 2).toUpperCase()}
							</AvatarFallback>
						</Avatar>
					</Link>
					{floor > 0 && (
						<span className="text-xs text-muted-foreground/60 w-8 text-center">
							#{floor}
						</span>
					)}
				</div>

				<div className="flex-1 min-w-0 pb-4 border-b border-border/50 last:border-0 last:pb-0">
					<div className="flex items-center gap-2 mb-1">
						<Link
							to="/users/$userId"
							params={{ userId: String(comment.user.id) }}
							className="font-semibold text-sm hover:underline"
						>
							{comment.user.username}
						</Link>
						<span className="text-muted-foreground/60 text-xs">·</span>
						<span className="text-muted-foreground text-xs">
							{isPending ? "发送中..." : formatRelativeTime(comment.createdAt)}
						</span>
						{comment.replyToFloor && (
							<>
								<span className="text-muted-foreground/60 text-xs">·</span>
								<span className="text-muted-foreground text-xs">
									回复
									<span className="font-semibold ml-0.5">
										{comment.replyToFloor}
									</span>
									楼
								</span>
							</>
						)}
					</div>

					{isEditing ? (
						<div className="space-y-2">
							<div className="rounded-lg border border-input overflow-hidden">
								<MarkdownToolbar
									textareaRef={textareaRef}
									content={editContent}
									onContentChange={setEditContent}
									className="rounded-t-lg rounded-b-none"
								/>
								<textarea
									ref={textareaRef}
									value={editContent}
									onChange={(e) => setEditContent(e.target.value)}
									onKeyDown={handleKeyDown}
									className="w-full min-h-[100px] p-3 bg-background text-sm resize-none focus:outline-none"
								/>
							</div>
							<div className="flex items-center gap-2">
								<Button
									size="sm"
									onClick={handleUpdate}
									disabled={updateComment.isPending}
								>
									{updateComment.isPending ? "保存中..." : "保存"}
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										setIsEditing(false);
										setEditContent(comment.content);
									}}
									disabled={updateComment.isPending}
								>
									取消
								</Button>
								<span className="text-xs text-muted-foreground ml-auto hidden sm:block">
									<kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
										Ctrl+Enter
									</kbd>{" "}
									保存 ·{" "}
									<kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
										Esc
									</kbd>{" "}
									取消
								</span>
							</div>
						</div>
					) : (
						<div
							className={cn(
								isDeleted && "text-muted-foreground italic text-sm",
							)}
						>
							{isDeleted ? (
								<p>{comment.content}</p>
							) : (
								<CommentContent content={comment.content} />
							)}
						</div>
					)}

					{!isEditing && !isDeleted && (
						<div className="flex gap-3 mt-2 items-center">
							<LikeButton
								targetId={comment.id}
								type="comment"
								initialLiked={comment.userState?.liked ?? false}
								initialCount={comment.likeCount ?? 0}
								size="sm"
							/>
							<button
								type="button"
								className="text-xs text-muted-foreground hover:text-foreground transition-colors"
								onClick={handleReply}
							>
								回复
							</button>
							{isAuthor && (
								<>
									<button
										type="button"
										className="text-xs text-muted-foreground hover:text-foreground transition-colors"
										onClick={() => setIsEditing(true)}
									>
										编辑
									</button>
									<button
										type="button"
										className="text-xs text-muted-foreground hover:text-destructive transition-colors"
										onClick={handleDelete}
										disabled={deleteComment.isPending}
									>
										删除
									</button>
								</>
							)}
						</div>
					)}
				</div>
			</div>
		);
	},
);

CommentItem.displayName = "CommentItem";

export default CommentItem;
