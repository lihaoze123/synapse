import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	Calendar,
	Code,
	Edit,
	FileText,
	MessageCircle,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/common";
import PublishModal, {
	type PublishData,
} from "@/components/publish/PublishModal";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth, useDeletePost, usePost, useUpdatePost } from "@/hooks";
import type { PostType } from "@/types";

export const Route = createFileRoute("/posts/$id")({
	component: PostDetailPage,
});

const typeConfig: Record<
	PostType,
	{ icon: typeof Code; label: string; color: string }
> = {
	SNIPPET: { icon: Code, label: "代码片段", color: "text-blue-600" },
	ARTICLE: { icon: FileText, label: "文章", color: "text-green-600" },
	MOMENT: { icon: MessageCircle, label: "动态", color: "text-amber-600" },
};

function PostDetailPage() {
	const { id } = Route.useParams();
	const postId = Number.parseInt(id, 10);
	const isValidId = !Number.isNaN(postId) && postId > 0;
	const { data: post, isLoading, error } = usePost(isValidId ? postId : 0);
	const { user: currentUser } = useAuth();
	const navigate = useNavigate();

	const updatePost = useUpdatePost();
	const deletePost = useDeletePost();

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [editError, setEditError] = useState("");

	// Check if current user is the author
	const isAuthor = currentUser && post && currentUser.id === post.user.id;

	const handleEdit = () => {
		setEditError("");
		setIsEditModalOpen(true);
	};

	const handleUpdatePost = (data: PublishData) => {
		updatePost.mutate(
			{ id: postId, data },
			{
				onSuccess: () => {
					setIsEditModalOpen(false);
				},
				onError: (err) => {
					setEditError(err.message || "保存失败，请重试");
				},
			},
		);
	};

	const handleDeleteConfirm = () => {
		deletePost.mutate(postId, {
			onSuccess: () => {
				setIsDeleteDialogOpen(false);
				navigate({ to: "/" });
			},
			onError: (err) => {
				console.error("Delete failed:", err);
				setIsDeleteDialogOpen(false);
			},
		});
	};

	if (!isValidId) {
		return (
			<div className="min-h-screen bg-background">
				<div className="max-w-4xl mx-auto px-4 py-8">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
					>
						<ArrowLeft className="h-4 w-4" />
						返回首页
					</Link>
					<Card className="p-8 text-center">
						<p className="text-muted-foreground">无效的帖子 ID</p>
					</Card>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return <PostDetailSkeleton />;
	}

	if (error || !post) {
		return (
			<div className="min-h-screen bg-background">
				<div className="max-w-4xl mx-auto px-4 py-8">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
					>
						<ArrowLeft className="h-4 w-4" />
						返回首页
					</Link>
					<Card className="p-8 text-center">
						<p className="text-muted-foreground">
							{error?.message || "帖子不存在或已被删除"}
						</p>
					</Card>
				</div>
			</div>
		);
	}

	const config = typeConfig[post.type];
	const TypeIcon = config.icon;

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Back navigation */}
				<Link
					to="/"
					className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
				>
					<ArrowLeft className="h-4 w-4" />
					返回首页
				</Link>

				<Card className="overflow-hidden">
					{/* Cover image for articles */}
					{post.type === "ARTICLE" && post.coverImage && (
						<div className="aspect-video w-full overflow-hidden">
							<img
								src={post.coverImage}
								alt={post.title || "文章封面"}
								className="h-full w-full object-cover"
							/>
						</div>
					)}

					<div className="p-6">
						{/* Header with edit/delete buttons */}
						<div className="flex items-start gap-3 mb-4">
							<div className="flex-1 flex items-center gap-3">
								{/* Author avatar */}
								<div className="shrink-0">
									{post.user.avatarUrl ? (
										<img
											src={post.user.avatarUrl}
											alt={`${post.user.username} 的头像`}
											className="h-10 w-10 rounded-full object-cover"
										/>
									) : (
										<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
											{post.user.username.charAt(0).toUpperCase()}
										</div>
									)}
								</div>

								<div className="flex-1 min-w-0">
									<div className="font-medium">{post.user.username}</div>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<TypeIcon className={`h-3.5 w-3.5 ${config.color}`} />
										<span>{config.label}</span>
										<span>·</span>
										<Calendar className="h-3.5 w-3.5" />
										<time dateTime={post.createdAt}>
											{new Date(post.createdAt).toLocaleDateString("zh-CN", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</time>
									</div>
								</div>
							</div>

							{/* Edit/Delete buttons - only for author */}
							{isAuthor && (
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={handleEdit}
										className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
									>
										<Edit className="h-4 w-4" />
										编辑
									</button>
									<button
										type="button"
										onClick={() => setIsDeleteDialogOpen(true)}
										className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
									>
										<Trash2 className="h-4 w-4" />
										删除
									</button>
								</div>
							)}
						</div>

						{/* Title for articles and snippets */}
						{post.title && (
							<h1 className="text-2xl font-bold mb-4">{post.title}</h1>
						)}

						{/* Content */}
						<div className="mt-4">
							{post.type === "SNIPPET" && (
								<div className="rounded-lg overflow-hidden">
									<CodeBlock
										code={post.content}
										language={post.language || "text"}
										maxLines={500}
									/>
								</div>
							)}

							{post.type === "ARTICLE" && (
								<div className="prose prose-neutral dark:prose-invert max-w-none">
									<Markdown
										remarkPlugins={[remarkGfm]}
										rehypePlugins={[rehypeSanitize]}
										components={{
											pre({ children }) {
												return <>{children}</>;
											},
											code(props) {
												const { children, className } = props;
												const match = /language-(\w+)/.exec(className || "");
												if (match) {
													return (
														<CodeBlock
															code={String(children).replace(/\n$/, "")}
															language={match[1]}
															maxLines={500}
														/>
													);
												}
												return <code className={className}>{children}</code>;
											},
										}}
									>
										{post.content}
									</Markdown>
								</div>
							)}

							{post.type === "MOMENT" && (
								<p className="text-lg whitespace-pre-wrap">{post.content}</p>
							)}
						</div>

						{/* Tags */}
						{post.tags.length > 0 && (
							<div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-border">
								{post.tags.map((tag) => (
									<Link
										key={tag.id}
										to="/"
										search={{ tag: tag.name }}
										className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm hover:bg-secondary/80 transition-colors"
									>
										<span>{tag.icon || "#"}</span>
										<span>{tag.name}</span>
									</Link>
								))}
							</div>
						)}
					</div>
				</Card>
			</div>

			{/* Edit Modal */}
			<PublishModal
				open={isEditModalOpen}
				onOpenChange={setIsEditModalOpen}
				mode="edit"
				initialData={post}
				onPublish={handleUpdatePost}
				isPublishing={updatePost.isPending}
				error={editError}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				title="确认删除"
				description="删除后无法恢复，确定要删除这篇帖子吗？"
				confirmLabel="删除"
				variant="destructive"
				onConfirm={handleDeleteConfirm}
				isConfirming={deletePost.isPending}
			/>
		</div>
	);
}

function PostDetailSkeleton() {
	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-4xl mx-auto px-4 py-8">
				<div className="h-5 w-24 bg-secondary/50 rounded animate-pulse mb-6" />
				<Card className="p-6">
					<div className="flex items-center gap-3 mb-4">
						<div className="h-10 w-10 rounded-full bg-secondary/50 animate-pulse" />
						<div className="space-y-2">
							<div className="h-4 w-24 bg-secondary/50 rounded animate-pulse" />
							<div className="h-3 w-32 bg-secondary/50 rounded animate-pulse" />
						</div>
					</div>
					<div className="h-8 w-3/4 bg-secondary/50 rounded animate-pulse mb-4" />
					<div className="space-y-3">
						<div className="h-4 w-full bg-secondary/50 rounded animate-pulse" />
						<div className="h-4 w-full bg-secondary/50 rounded animate-pulse" />
						<div className="h-4 w-2/3 bg-secondary/50 rounded animate-pulse" />
					</div>
				</Card>
			</div>
		</div>
	);
}
