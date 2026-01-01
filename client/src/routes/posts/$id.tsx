import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
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
import CommentSection from "@/components/comments/CommentSection";
import { CodeBlock } from "@/components/common";
import { BookmarkButton } from "@/components/common/BookmarkButton";
import FollowButton from "@/components/common/FollowButton";
import { ImagePreviewModal } from "@/components/common/ImagePreviewModal";
import { Layout } from "@/components/layout";
import PublishModal, {
	type PublishData,
} from "@/components/publish/PublishModal";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth, useDeletePost, usePost, useUpdatePost } from "@/hooks";
import { resolveStaticUrl } from "@/services/api";
import type { PostType } from "@/types";

export const Route = createFileRoute("/posts/$id")({
	component: PostDetailPage,
	staticData: {
		breadcrumb: {
			label: (match: { params: { id: string } }) => {
				const params = match.params;
				return `文章 #${params.id}`;
			},
		},
	},
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
	const [previewIndex, setPreviewIndex] = useState<number | null>(null);

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
			<Layout>
				<div className="max-w-4xl mx-auto">
					<Card className="p-8 text-center">
						<p className="text-muted-foreground">无效的帖子 ID</p>
					</Card>
				</div>
			</Layout>
		);
	}

	if (isLoading) {
		return <PostDetailSkeleton />;
	}

	if (error || !post) {
		return (
			<Layout>
				<div className="max-w-4xl mx-auto">
					<Card className="p-8 text-center">
						<p className="text-muted-foreground">
							{error?.message || "帖子不存在或已被删除"}
						</p>
					</Card>
				</div>
			</Layout>
		);
	}

	const config = typeConfig[post.type];
	const TypeIcon = config.icon;

	return (
		<Layout>
			<div className="max-w-4xl mx-auto">
				<Card className="overflow-hidden">
					{post.type === "ARTICLE" && post.coverImage && (
						<div className="aspect-video w-full overflow-hidden">
							<img
								src={resolveStaticUrl(post.coverImage)}
								alt={post.title || "文章封面"}
								className="h-full w-full object-cover"
							/>
						</div>
					)}

					<div className="p-6">
						<div className="mb-4 flex items-start justify-between gap-3">
							<div className="flex flex-1 items-center gap-3">
								<Link
									to="/users/$userId"
									params={{ userId: String(post.user.id) }}
									className="shrink-0"
								>
									{post.user.avatarUrl ? (
										<img
											src={post.user.avatarUrl}
											alt={`${post.user.username} 的头像`}
											className="h-10 w-10 rounded-full object-cover ring-2 ring-border/30 hover:ring-primary/50 transition-all"
										/>
									) : (
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium ring-2 ring-border/30 hover:ring-primary/50 transition-all">
											{post.user.username.charAt(0).toUpperCase()}
										</div>
									)}
								</Link>

								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-3">
										<Link
											to="/users/$userId"
											params={{ userId: String(post.user.id) }}
											className="font-medium hover:underline"
										>
											{post.user.username}
										</Link>
										{!isAuthor && (
											<FollowButton userId={post.user.id} size="sm" />
										)}
									</div>
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

							<div className="flex items-center gap-2">
								{!isAuthor && <FollowButton userId={post.user.id} size="sm" />}
								<BookmarkButton postId={post.id} size="md" />

								{isAuthor && (
									<>
										<button
											type="button"
											onClick={handleEdit}
											className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
										>
											<Edit className="h-4 w-4" />
											编辑
										</button>
										<button
											type="button"
											onClick={() => setIsDeleteDialogOpen(true)}
											className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
										>
											<Trash2 className="h-4 w-4" />
											删除
										</button>
									</>
								)}
							</div>
						</div>

						{post.title && (
							<h1 className="mb-4 text-2xl font-bold">{post.title}</h1>
						)}

						<div className="mt-4">
							{post.type === "SNIPPET" && (
								<div className="overflow-hidden rounded-lg">
									<CodeBlock
										code={post.content}
										language={post.language || "text"}
										maxLines={500}
									/>
								</div>
							)}

							{post.type === "ARTICLE" && (
								<div className="prose prose-neutral max-w-none dark:prose-invert">
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
								<div className="space-y-4">
									<p className="text-lg whitespace-pre-wrap">{post.content}</p>
									{post.images && post.images.length > 0 && (
										<div
											className={`grid gap-1.5 max-w-[300px] ${
												post.images.length === 1
													? "grid-cols-1"
													: post.images.length === 2
														? "grid-cols-2"
														: "grid-cols-3"
											}`}
										>
											{post.images.map((url, index) => (
												<button
													key={url}
													type="button"
													className="relative overflow-hidden rounded-md bg-muted aspect-square cursor-pointer p-0 border-0"
													onClick={() => setPreviewIndex(index)}
												>
													<img
														src={resolveStaticUrl(url)}
														alt={`图片 ${index + 1}`}
														className="absolute inset-0 h-full w-full object-cover"
														loading="lazy"
													/>
												</button>
											))}
										</div>
									)}
								</div>
							)}
						</div>

						{post.tags.length > 0 && (
							<div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6">
								{post.tags.map((tag) => (
									<Link
										key={tag.id}
										to="/"
										search={{ tag: tag.name }}
										className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm transition-colors hover:bg-secondary/80"
									>
										<span>{tag.icon || "#"}</span>
										<span>{tag.name}</span>
									</Link>
								))}
							</div>
						)}
					</div>
				</Card>

				<div className="mt-8">
					<h2 className="mb-6 text-xl font-bold">评论</h2>
					<CommentSection postId={postId} />
				</div>
			</div>

			<PublishModal
				open={isEditModalOpen}
				onOpenChange={setIsEditModalOpen}
				mode="edit"
				initialData={post}
				onPublish={handleUpdatePost}
				isPublishing={updatePost.isPending}
				error={editError}
			/>

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

			<ImagePreviewModal
				images={post.images || []}
				open={previewIndex !== null}
				initialIndex={previewIndex ?? 0}
				onOpenChange={(open) => setPreviewIndex(open ? 0 : null)}
			/>
		</Layout>
	);
}

function PostDetailSkeleton() {
	return (
		<Layout>
			<div className="max-w-4xl mx-auto">
				<Card className="p-6">
					<div className="mb-4 flex items-center gap-3">
						<div className="h-10 w-10 animate-pulse rounded-full bg-secondary/50" />
						<div className="space-y-2">
							<div className="h-4 w-24 animate-pulse rounded bg-secondary/50" />
							<div className="h-3 w-32 animate-pulse rounded bg-secondary/50" />
						</div>
					</div>
					<div className="mb-4 h-8 w-3/4 animate-pulse rounded bg-secondary/50" />
					<div className="space-y-3">
						<div className="h-4 w-full animate-pulse rounded bg-secondary/50" />
						<div className="h-4 w-full animate-pulse rounded bg-secondary/50" />
						<div className="h-4 w-2/3 animate-pulse rounded bg-secondary/50" />
					</div>
				</Card>
			</div>
		</Layout>
	);
}
