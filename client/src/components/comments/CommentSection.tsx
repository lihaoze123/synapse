import { createRef, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { useCreateComment, usePostComments } from "@/hooks/useComments";
import type { Comment } from "@/types";
import CommentEditor, { type CommentEditorRef } from "./CommentEditor";
import CommentItem from "./CommentItem";
import CommentSkeleton from "./CommentSkeleton";

interface CommentSectionProps {
	postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
	const { user } = useAuth();
	const {
		data,
		isLoading,
		isError,
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
	const [highlightedCommentId, setHighlightedCommentId] = useState<
		number | null
	>(null);

	const editorRef = useRef<CommentEditorRef>(null);
	const commentRefs = useRef<
		Map<number, React.RefObject<HTMLDivElement | null>>
	>(new Map());

	const allComments = data?.pages.flatMap((page) => page.content) ?? [];

	const getCommentRef = (commentId: number) => {
		let ref = commentRefs.current.get(commentId);
		if (!ref) {
			ref = createRef<HTMLDivElement | null>();
			commentRefs.current.set(commentId, ref);
		}
		return ref;
	};

	useEffect(() => {
		if (highlightedCommentId) {
			const timer = setTimeout(() => setHighlightedCommentId(null), 2500);
			return () => clearTimeout(timer);
		}
	}, [highlightedCommentId]);

	const handleSubmit = () => {
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
				onSuccess: (newComment: Comment) => {
					setContent("");
					setReplyTo(null);
					setHighlightedCommentId(newComment.id);

					setTimeout(() => {
						const ref = commentRefs.current.get(newComment.id);
						ref?.current?.scrollIntoView({
							behavior: "smooth",
							block: "center",
						});
					}, 100);
				},
			},
		);
	};

	const handleReply = (commentId: number, username: string, floor: number) => {
		setReplyTo({ id: commentId, username, floor });
		setContent("");
		editorRef.current?.scrollIntoView();
	};

	const handleCancelReply = () => {
		setReplyTo(null);
		setContent("");
	};

	return (
		<div className="space-y-6">
			{/* Comment Editor */}
			{user ? (
				<CommentEditor
					ref={editorRef}
					value={content}
					onChange={setContent}
					onSubmit={handleSubmit}
					onCancel={replyTo ? handleCancelReply : undefined}
					isSubmitting={createComment.isPending}
					replyTo={replyTo}
					placeholder={
						replyTo ? `回复 ${replyTo.username}...` : "写下你的评论..."
					}
				/>
			) : (
				<div className="text-center py-6 bg-muted/30 rounded-xl">
					<p className="text-muted-foreground text-sm">
						请先<span className="text-primary font-semibold">登录</span>
						后发表评论
					</p>
				</div>
			)}

			{/* Comments List */}
			<div className="space-y-4">
				{isError ? (
					<p className="text-center text-muted-foreground text-sm">
						加载评论失败
					</p>
				) : isLoading ? (
					<CommentSkeleton count={3} />
				) : allComments.length > 0 ? (
					<>
						{allComments.map((comment) => (
							<CommentItem
								key={comment.id}
								ref={getCommentRef(comment.id)}
								comment={comment}
								postId={postId}
								isHighlighted={highlightedCommentId === comment.id}
								onReply={handleReply}
							/>
						))}
						{hasNextPage && (
							<div className="text-center pt-2">
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
