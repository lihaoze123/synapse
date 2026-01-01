import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { useCreateComment, usePostComments } from "@/hooks/useComments";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
	postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
	const { user } = useAuth();
	const {
		data,
		isLoading,
		isError,
		refetch,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = usePostComments(postId);
	const createComment = useCreateComment();

	const [content, setContent] = useState("");
	const [replyTo, setReplyTo] = useState<{
		id: number;
		username: string;
		floor: number;
	} | null>(null);
	const [showSuccess, setShowSuccess] = useState(false);

	const allComments = data?.pages.flatMap((page) => page.content) ?? [];

	// Auto-hide success message after 3 seconds
	useEffect(() => {
		if (showSuccess) {
			const timer = setTimeout(() => setShowSuccess(false), 3000);
			return () => clearTimeout(timer);
		}
	}, [showSuccess]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!content.trim()) return;

		const parentId = replyTo?.id;

		createComment.mutate(
			{
				postId,
				data: {
					content: replyTo ? `@${replyTo.username} ${content}` : content,
					parentId,
				},
			},
			{
				onSuccess: () => {
					setContent("");
					setReplyTo(null);
					setShowSuccess(true);
					refetch();
				},
			},
		);
	};

	const handleReply = (commentId: number, username: string, floor: number) => {
		setReplyTo({ id: commentId, username, floor });
		setContent("");
	};

	const cancelReply = () => {
		setReplyTo(null);
		setContent("");
	};

	return (
		<div className="space-y-6">
			{/* Success Toast */}
			{showSuccess && (
				<div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-4 py-2 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
					<CheckCircle2 className="h-4 w-4" />
					<span>评论发表成功</span>
				</div>
			)}

			{/* Comment Form */}
			{user ? (
				<form onSubmit={handleSubmit} className="space-y-3">
					{replyTo && (
						<div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
							<span className="text-sm text-muted-foreground">
								回复{" "}
								<span className="font-semibold text-foreground">
									{replyTo.floor} 楼
								</span>
							</span>
							<button
								type="button"
								className="text-muted-foreground hover:text-foreground text-sm"
								onClick={cancelReply}
							>
								取消
							</button>
						</div>
					)}
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="写下你的评论..."
						className="w-full min-h-[100px] p-4 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60"
					/>
					<div className="flex justify-end">
						<Button
							type="submit"
							size="sm"
							disabled={!content.trim() || createComment.isPending}
						>
							{createComment.isPending ? "发送中..." : "发送评论"}
						</Button>
					</div>
				</form>
			) : (
				<div className="text-center py-6 bg-muted/30 rounded-xl">
					<p className="text-muted-foreground text-sm">
						请先<span className="text-primary font-semibold">登录</span>
						后发表评论
					</p>
				</div>
			)}

			{/* Mobile bottom action bar handles comment entry; no floating composer needed */}

			{/* Comments List */}
			<div className="space-y-4">
				{isError ? (
					<p className="text-center text-muted-foreground text-sm">
						加载评论失败
					</p>
				) : isLoading && allComments.length === 0 ? (
					<p className="text-center text-muted-foreground text-sm">加载中...</p>
				) : allComments.length > 0 ? (
					<>
						{allComments.map((comment) => (
							<CommentItem
								key={comment.id}
								comment={comment}
								postId={postId}
								onReply={handleReply}
							/>
						))}
						{hasNextPage && (
							<div className="text-center">
								<Button
									variant="outline"
									size="sm"
									onClick={() => fetchNextPage()}
									disabled={isFetchingNextPage}
								>
									{isFetchingNextPage ? "加载中..." : "加载更多"}
								</Button>
							</div>
						)}
					</>
				) : (
					<p className="text-center text-muted-foreground text-sm py-6">
						还没有评论，快来抢沙发吧~
					</p>
				)}
			</div>
		</div>
	);
}
