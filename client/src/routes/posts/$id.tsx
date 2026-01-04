import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	Calendar,
	Code,
	Edit,
	FileText,
	Lock,
	MessageCircle,
	Trash2,
} from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
// Desktop actions remain as before; mobile hides top action buttons
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import CommentSection from "@/components/comments/CommentSection";
import { CodeBlock } from "@/components/common";
import { AttachmentList } from "@/components/common/AttachmentList";
import { BookmarkButton } from "@/components/common/BookmarkButton";
import FollowButton from "@/components/common/FollowButton";
import { ImagePreviewModal } from "@/components/common/ImagePreviewModal";
import { LikeButton } from "@/components/common/LikeButton";
import { PasswordModal } from "@/components/common/PasswordModal";
import { Layout } from "@/components/layout";
import PublishModal, {
	type PublishData,
} from "@/components/publish/PublishModal";
import { AnimatedPage } from "@/components/ui/animations";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth, useDeletePost, usePost, useUpdatePost } from "@/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { resolveStaticUrl } from "@/services/api";
import { postsService } from "@/services/posts";
import type { Post, PostType } from "@/types";
import { getUnlockedPost, setUnlockedPost } from "@/utils/privatePost";

// No dropdown menu for desktop; restore original inline buttons

const MobileActionBar = lazy(() =>
	import("@/components/layout/MobileActionBar").then((m) => ({
		default: m.MobileActionBar,
	})),
);

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
	const isMobile = useIsMobile();

	const updatePost = useUpdatePost();
	const deletePost = useDeletePost();

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [editError, setEditError] = useState("");
	const [previewIndex, setPreviewIndex] = useState<number | null>(null);

	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [passwordError, setPasswordError] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [unlockedPost, setUnlockedPostState] = useState<Post | null>(null);

	const isAuthor = currentUser && post && currentUser.id === post.user.id;
	const isPrivateLocked = post?.isPrivate && !post?.content && !isAuthor;

	useEffect(() => {
		if (post?.isPrivate && !post?.content && !isAuthor) {
			const cached = getUnlockedPost(postId);
			if (cached) {
				setUnlockedPostState(cached);
			} else {
				setShowPasswordModal(true);
			}
		}
	}, [post, postId, isAuthor]);

	const displayPost = unlockedPost || post;

	const handlePasswordSubmit = async (password: string) => {
		setPasswordError("");
		setIsVerifying(true);
		try {
			const fullPost = await postsService.verifyPostPassword(postId, password);
			setUnlockedPost(fullPost);
			setUnlockedPostState(fullPost);
			setShowPasswordModal(false);
		} catch (err) {
			setPasswordError(err instanceof Error ? err.message : "密码错误");
		} finally {
			setIsVerifying(false);
		}
	};

	const handlePasswordCancel = () => {
		setShowPasswordModal(false);
		navigate({ to: "/" });
	};

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
				<AnimatedPage transition="slideRight">
					<div className="max-w-4xl mx-auto">
						<Card className="p-8 text-center">
							<p className="text-muted-foreground">无效的帖子 ID</p>
						</Card>
					</div>
				</AnimatedPage>
			</Layout>
		);
	}

	if (isLoading) {
		return <PostDetailSkeleton />;
	}

	if (error || !post) {
		return (
			<Layout>
				<AnimatedPage transition="slideRight">
					<div className="max-w-4xl mx-auto">
						<Card className="p-8 text-center">
							<p className="text-muted-foreground">
								{error?.message || "帖子不存在或已被删除"}
							</p>
						</Card>
					</div>
				</AnimatedPage>
			</Layout>
		);
	}

	const config = typeConfig[post.type];
	const TypeIcon = config.icon;
	const createdDate = new Date(post.createdAt);
	const dateLong = createdDate.toLocaleDateString("zh-CN", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const dateShort = createdDate.toLocaleDateString("zh-CN", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});

	const showLockedView = isPrivateLocked && !unlockedPost;

	return (
		<Layout>
			<AnimatedPage transition="slideRight">
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
							<div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
								<div className="flex flex-1 items-center gap-3 min-w-0">
									<Link
										to="/users/$userId"
										params={{ userId: String(post.user.id) }}
										className="shrink-0"
									>
										{post.user.avatarUrl ? (
											<img
												src={post.user.avatarUrl}
												alt={`${post.user.displayName || post.user.username} 的头像`}
												className="h-10 w-10 rounded-full object-cover ring-2 ring-border/30 hover:ring-primary/50 transition-all"
											/>
										) : (
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium ring-2 ring-border/30 hover:ring-primary/50 transition-all">
												{(post.user.displayName || post.user.username)
													.charAt(0)
													.toUpperCase()}
											</div>
										)}
									</Link>

									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2 sm:gap-3">
											<Link
												to="/users/$userId"
												params={{ userId: String(post.user.id) }}
												className="font-medium hover:underline truncate"
											>
												{post.user.displayName || post.user.username}
											</Link>
											{!isAuthor && (
												<FollowButton userId={post.user.id} size="sm" />
											)}
										</div>
										<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground">
											<div className="flex items-center gap-1 whitespace-nowrap">
												<TypeIcon className={`h-3.5 w-3.5 ${config.color}`} />
												<span className="hidden sm:inline">{config.label}</span>
											</div>
											<span className="hidden sm:inline">·</span>
											<div className="flex items-center gap-1 whitespace-nowrap">
												<Calendar className="h-3.5 w-3.5" />
												<time
													className="whitespace-nowrap"
													dateTime={post.createdAt}
												>
													<span className="sm:hidden">{dateShort}</span>
													<span className="hidden sm:inline">{dateLong}</span>
												</time>
											</div>
										</div>
									</div>
								</div>

								<div className="hidden md:flex items-center gap-2 flex-shrink-0 sm:w-auto justify-end">
									<LikeButton
										targetId={post.id}
										type="post"
										initialLiked={post.userState?.liked ?? false}
										initialCount={post.likeCount ?? 0}
										size="md"
									/>
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
								<div className="mb-8 border-b border-border pb-6">
									<h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
										{post.title}
									</h1>
								</div>
							)}

							<div className="mt-4">
								{showLockedView ? (
									<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
										<div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
											<Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
										</div>
										<p className="text-lg font-medium">私密内容</p>
										<p className="text-sm mt-2">需要密码查看</p>
										<button
											type="button"
											onClick={() => setShowPasswordModal(true)}
											className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
										>
											输入密码
										</button>
									</div>
								) : (
									<>
										{displayPost?.type === "SNIPPET" && (
											<div className="overflow-hidden rounded-lg border bg-muted/30">
												<CodeBlock
													code={displayPost.content || ""}
													language={displayPost.language || "text"}
													maxLines={500}
												/>
											</div>
										)}

										{displayPost?.type === "ARTICLE" && (
											<div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4 prose-h2:text-xl prose-h2:mt-6 prose-p:leading-7 prose-p:text-foreground/90 prose-img:rounded-xl prose-img:border prose-pre:p-0 prose-pre:m-0 prose-pre:bg-transparent prose-pre:border-0 prose-code:before:content-none prose-code:after:content-none">
												<Markdown
													remarkPlugins={[remarkGfm, remarkMath]}
													rehypePlugins={[rehypeKatex]}
													components={{
														pre({ children }) {
															return <>{children}</>;
														},
														code({ className, children, ...props }) {
															const match = /language-(\w+)/.exec(
																className || "",
															);
															if (match) {
																return (
																	<CodeBlock
																		code={String(children).replace(/\n$/, "")}
																		language={match[1]}
																		maxLines={500}
																	/>
																);
															}
															return (
																<code
																	className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
																	{...props}
																>
																	{children}
																</code>
															);
														},
													}}
												>
													{displayPost.content || ""}
												</Markdown>
											</div>
										)}

										{displayPost?.type === "MOMENT" && (
											<div className="space-y-4">
												<p className="text-lg whitespace-pre-wrap leading-relaxed">
													{displayPost.content}
												</p>
												{displayPost.images &&
													displayPost.images.length > 0 && (
														<div
															className={`grid gap-2 max-w-[400px] ${
																displayPost.images.length === 1
																	? "grid-cols-1"
																	: displayPost.images.length === 2
																		? "grid-cols-2"
																		: "grid-cols-3"
															}`}
														>
															{displayPost.images.map((url, index) => (
																<button
																	key={url}
																	type="button"
																	className="relative overflow-hidden rounded-lg bg-muted aspect-square cursor-pointer ring-1 ring-border/50 hover:ring-primary/50 transition-all"
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
									</>
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

							{post.attachments &&
								post.attachments.length > 0 &&
								!showLockedView && (
									<div className="mt-6 border-t border-border pt-6">
										<AttachmentList
											attachments={displayPost?.attachments || post.attachments}
										/>
									</div>
								)}
						</div>
					</Card>

					{/* biome-ignore lint/correctness/useUniqueElementIds: single instance on page; anchor target for MobileActionBar */}
					<div className="mt-8" id="comments">
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
					images={displayPost?.images || post.images || []}
					open={previewIndex !== null}
					initialIndex={previewIndex ?? 0}
					onOpenChange={(open) => setPreviewIndex(open ? 0 : null)}
				/>

				<PasswordModal
					open={showPasswordModal}
					onSubmit={handlePasswordSubmit}
					onCancel={handlePasswordCancel}
					isLoading={isVerifying}
					error={passwordError}
				/>

				{isMobile && (
					<Suspense fallback={null}>
						<MobileActionBar
							postId={postId}
							initialLiked={post.userState?.liked ?? false}
							initialLikeCount={post.likeCount ?? 0}
							isAuthor={!!isAuthor}
							onEdit={handleEdit}
							onDelete={() => setIsDeleteDialogOpen(true)}
						/>
					</Suspense>
				)}
			</AnimatedPage>
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
					<div className="mb-10 h-12 w-11/12 animate-pulse rounded bg-secondary/50" />
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
