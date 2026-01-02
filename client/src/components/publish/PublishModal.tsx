import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
	Code,
	FileText,
	Lock,
	Maximize2,
	MessageCircle,
	Minimize2,
	X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	FileUploader,
	type UploadedAttachment,
} from "@/components/upload/FileUploader";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { useAllTags } from "@/hooks";
import { cn } from "@/lib/utils";
import type { Post, PostType } from "@/types";
import {
	clearDraft,
	type DraftData,
	loadDraft,
	saveDraft,
} from "@/utils/draftStorage";
import ArticleEditor from "./ArticleEditor";
import MomentEditor from "./MomentEditor";
import RestoreDraftModal from "./RestoreDraftModal";
import SnippetEditor from "./SnippetEditor";
import TagInput from "./TagInput";

interface PublishModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialType?: PostType;
	onPublish: (data: PublishData) => void;
	isPublishing?: boolean;
	error?: string;
	mode?: "create" | "edit";
	initialData?: Post;
}

export interface PublishData {
	type: PostType;
	title?: string;
	content: string;
	language?: string;
	coverImage?: string;
	images?: string[];
	tags: string[];
	attachments?: {
		filename: string;
		storedName: string;
		fileSize: number;
		contentType: string;
	}[];
	isPrivate?: boolean;
	password?: string;
}

const TABS = [
	{ type: "MOMENT" as PostType, icon: MessageCircle, label: "动态" },
	{ type: "SNIPPET" as PostType, icon: Code, label: "代码" },
	{ type: "ARTICLE" as PostType, icon: FileText, label: "文章" },
];

export default function PublishModal({
	open,
	onOpenChange,
	initialType = "MOMENT",
	onPublish,
	isPublishing = false,
	error,
	mode = "create",
	initialData,
}: PublishModalProps) {
	const [activeType, setActiveType] = useState<PostType>(initialType);
	const [tags, setTags] = useState<string[]>([]);
	const [isFullscreen, setIsFullscreen] = useState(false);

	// Draft state
	const [showRestorePrompt, setShowRestorePrompt] = useState(false);
	const [pendingDraft, setPendingDraft] = useState<DraftData | null>(null);
	const hasRestoredDraft = useRef(false);

	const isEditMode = mode === "edit";
	const modalTitle = isEditMode ? "编辑内容" : "发布内容";
	const buttonText = isPublishing
		? isEditMode
			? "保存中..."
			: "发布中..."
		: isEditMode
			? "保存"
			: "发布";

	useEffect(() => {
		if (open) {
			if (isEditMode && initialData) {
				setActiveType(initialData.type);
			} else {
				setActiveType(initialType);
			}
		} else {
			setIsFullscreen(false);
			// Reset draft restoration state when modal closes
			setShowRestorePrompt(false);
			setPendingDraft(null);
			hasRestoredDraft.current = false;
		}
	}, [open, initialType, isEditMode, initialData]);

	// Check for drafts when opening in create mode
	useEffect(() => {
		if (open && !isEditMode && !hasRestoredDraft.current) {
			const draft = loadDraft(activeType);
			if (draft) {
				setPendingDraft(draft);
				setShowRestorePrompt(true);
			}
		}
	}, [open, isEditMode, activeType]);

	const { data: allTags } = useAllTags(open);
	const tagSuggestions = useMemo(
		() => allTags?.map((t) => t.name) ?? [],
		[allTags],
	);

	const [momentContent, setMomentContent] = useState("");
	const [momentImages, setMomentImages] = useState<string[]>([]);

	const [snippetTitle, setSnippetTitle] = useState("");
	const [snippetCode, setSnippetCode] = useState("");
	const [snippetLanguage, setSnippetLanguage] = useState("javascript");

	const [articleTitle, setArticleTitle] = useState("");
	const [articleContent, setArticleContent] = useState("");
	const [articleCoverImage, setArticleCoverImage] = useState<
		string | undefined
	>(undefined);

	const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);

	const [isPrivate, setIsPrivate] = useState(false);
	const [password, setPassword] = useState("");

	// Auto-save draft with debounce (only in create mode)
	useEffect(() => {
		if (!open || isEditMode) return;

		const timer = setTimeout(() => {
			saveDraft(activeType, {
				momentContent,
				momentImages,
				snippetTitle,
				snippetCode,
				snippetLanguage,
				articleTitle,
				articleContent,
				articleCoverImage,
				tags,
				attachments,
				isPrivate,
				password,
			});
		}, 1000);

		return () => clearTimeout(timer);
	}, [
		open,
		isEditMode,
		activeType,
		momentContent,
		momentImages,
		snippetTitle,
		snippetCode,
		snippetLanguage,
		articleTitle,
		articleContent,
		articleCoverImage,
		tags,
		attachments,
		isPrivate,
		password,
	]);

	useEffect(() => {
		if (open && isEditMode && initialData) {
			setTags(initialData.tags.map((t) => t.name));

			switch (initialData.type) {
				case "MOMENT":
					setMomentContent(initialData.content || "");
					setMomentImages(initialData.images || []);
					break;
				case "SNIPPET":
					setSnippetTitle(initialData.title || "");
					setSnippetCode(initialData.content || "");
					setSnippetLanguage(initialData.language || "javascript");
					break;
				case "ARTICLE":
					setArticleTitle(initialData.title || "");
					setArticleContent(initialData.content || "");
					setArticleCoverImage(initialData.coverImage || undefined);
					break;
			}

			if (initialData?.attachments) {
				setAttachments(
					initialData.attachments.map((a) => ({
						filename: a.filename,
						storedName: a.url.replace("/uploads/", ""),
						url: a.url,
						fileSize: a.fileSize,
						contentType: a.contentType,
					})),
				);
			}

			setIsPrivate(initialData.isPrivate ?? false);
			setPassword("");
		} else if (open && !isEditMode) {
			setMomentContent("");
			setMomentImages([]);
			setSnippetTitle("");
			setSnippetCode("");
			setSnippetLanguage("javascript");
			setArticleTitle("");
			setArticleContent("");
			setArticleCoverImage(undefined);
			setTags([]);
			setAttachments([]);
			setIsPrivate(false);
			setPassword("");
		}
	}, [open, isEditMode, initialData]);

	const resetForm = () => {
		setMomentContent("");
		setMomentImages([]);
		setSnippetTitle("");
		setSnippetCode("");
		setSnippetLanguage("javascript");
		setArticleTitle("");
		setArticleContent("");
		setArticleCoverImage(undefined);
		setTags([]);
		setAttachments([]);
		setIsPrivate(false);
		setPassword("");
	};

	const handleRestoreDraft = () => {
		if (!pendingDraft) return;

		const draft = pendingDraft;
		setTags(draft.tags);
		setAttachments(draft.attachments);
		setIsPrivate(draft.isPrivate);
		setPassword(draft.password);

		switch (draft.type) {
			case "MOMENT":
				setMomentContent(draft.momentContent || "");
				setMomentImages(draft.momentImages || []);
				break;
			case "SNIPPET":
				setSnippetTitle(draft.snippetTitle || "");
				setSnippetCode(draft.snippetCode || "");
				setSnippetLanguage(draft.snippetLanguage || "javascript");
				break;
			case "ARTICLE":
				setArticleTitle(draft.articleTitle || "");
				setArticleContent(draft.articleContent || "");
				setArticleCoverImage(draft.articleCoverImage);
				break;
		}

		hasRestoredDraft.current = true;
		setShowRestorePrompt(false);
		setPendingDraft(null);
	};

	const handleDiscardDraft = () => {
		if (pendingDraft) {
			clearDraft(pendingDraft.type);
		}
		setShowRestorePrompt(false);
		setPendingDraft(null);
	};

	const handleClose = () => {
		onOpenChange(false);
		resetForm();
	};

	const handlePublish = () => {
		let data: PublishData;

		const privateFields = isPrivate
			? { isPrivate: true, password: password.trim() || undefined }
			: { isPrivate: false };

		switch (activeType) {
			case "MOMENT":
				data = {
					type: "MOMENT",
					content: momentContent,
					images: momentImages.length > 0 ? momentImages : undefined,
					tags,
					attachments: attachments.length > 0 ? attachments : undefined,
					...privateFields,
				};
				break;
			case "SNIPPET":
				data = {
					type: "SNIPPET",
					title: snippetTitle || undefined,
					content: snippetCode,
					language: snippetLanguage,
					tags,
					attachments: attachments.length > 0 ? attachments : undefined,
					...privateFields,
				};
				break;
			case "ARTICLE":
				data = {
					type: "ARTICLE",
					title: articleTitle,
					content: articleContent,
					coverImage: articleCoverImage,
					tags,
					attachments: attachments.length > 0 ? attachments : undefined,
					...privateFields,
				};
				break;
		}

		onPublish(data);

		// Clear draft after successful publish (only in create mode)
		if (!isEditMode) {
			clearDraft(activeType);
		}
	};

	const canPublish = () => {
		if (isPrivate && !password.trim()) {
			return false;
		}

		switch (activeType) {
			case "MOMENT":
				return momentContent.trim().length > 0;
			case "SNIPPET":
				return snippetCode.trim().length > 0;
			case "ARTICLE":
				return (
					articleTitle.trim().length > 0 && articleContent.trim().length > 0
				);
		}
	};

	const handleCoverChange = (urls: string[]) => {
		setArticleCoverImage(urls[0] || undefined);
	};

	// Desktop fullscreen layout
	if (isFullscreen) {
		return (
			<>
				<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
					<DialogPrimitive.Portal>
						<DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity" />
						<DialogPrimitive.Popup
							className={cn(
								"fixed inset-0 z-50 bg-background",
								"data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
								"transition-opacity duration-200",
								"flex",
							)}
						>
							{/* Left Rail - Type Navigation */}
							{!isEditMode && (
								<div className="hidden sm:flex w-16 flex-col items-center border-r border-border bg-muted/30 py-4 gap-1 shrink-0">
									{TABS.map(({ type, icon: Icon, label }) => (
										<button
											key={type}
											type="button"
											onClick={() => setActiveType(type)}
											className={cn(
												"flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all",
												activeType === type
													? "bg-primary text-primary-foreground shadow-sm"
													: "text-muted-foreground hover:bg-muted hover:text-foreground",
											)}
											title={label}
										>
											<Icon className="h-5 w-5" />
										</button>
									))}
								</div>
							)}

							{/* Main Content Area */}
							<div className="flex-1 flex flex-col min-w-0">
								{/* Top Bar */}
								<div className="flex items-center justify-between border-b border-border px-6 py-3 shrink-0 bg-background/80 backdrop-blur-sm">
									<div className="flex items-center gap-3">
										<DialogPrimitive.Title className="text-lg font-semibold">
											{modalTitle}
										</DialogPrimitive.Title>
										<span className="text-sm text-muted-foreground">
											{TABS.find((t) => t.type === activeType)?.label}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => setIsFullscreen(false)}
											className={cn(
												"hidden sm:flex h-9 w-9 items-center justify-center rounded-lg",
												"text-muted-foreground hover:bg-muted hover:text-foreground",
												"transition-colors",
											)}
											title="退出全屏"
										>
											<Minimize2 className="h-4 w-4" />
										</button>
										<DialogPrimitive.Close
											className="rounded-lg p-2 hover:bg-muted transition-colors"
											onClick={handleClose}
										>
											<X className="h-5 w-5" />
										</DialogPrimitive.Close>
									</div>
								</div>

								{/* Editor Content */}
								<div className="flex-1 flex min-h-0">
									{/* Main Editor */}
									<div className="flex-1 overflow-y-auto min-w-0">
										<div
											className={cn(
												"h-full",
												activeType === "MOMENT" &&
													"max-w-2xl mx-auto px-6 py-6",
												activeType === "SNIPPET" && "p-6",
												activeType === "ARTICLE" && "p-6",
											)}
										>
											{activeType === "MOMENT" && (
												<MomentEditor
													content={momentContent}
													onChange={setMomentContent}
													images={momentImages}
													onImagesChange={setMomentImages}
												/>
											)}

											{activeType === "SNIPPET" && (
												<SnippetEditor
													title={snippetTitle}
													onTitleChange={setSnippetTitle}
													code={snippetCode}
													onCodeChange={setSnippetCode}
													language={snippetLanguage}
													onLanguageChange={setSnippetLanguage}
													isFullscreen
													className="h-full"
												/>
											)}

											{activeType === "ARTICLE" && (
												<ArticleEditor
													title={articleTitle}
													onTitleChange={setArticleTitle}
													content={articleContent}
													onContentChange={setArticleContent}
													coverImage={articleCoverImage}
													onCoverImageChange={setArticleCoverImage}
													isFullscreen
													className="h-full"
												/>
											)}
										</div>
									</div>

									{/* Right Sidebar - Metadata */}
									<div className="hidden lg:flex w-72 xl:w-80 flex-col border-l border-border bg-muted/20 shrink-0">
										<div className="flex-1 overflow-y-auto p-5 space-y-6">
											{/* Article Metadata */}
											{activeType === "ARTICLE" && (
												<>
													{/* Title */}
													<div className="space-y-2">
														<span className="text-sm font-medium text-foreground">
															文章标题
														</span>
														<input
															type="text"
															value={articleTitle}
															onChange={(e) => setArticleTitle(e.target.value)}
															placeholder="输入文章标题..."
															className={cn(
																"w-full rounded-lg border border-input bg-background",
																"px-3 py-2.5 text-sm",
																"placeholder:text-muted-foreground",
																"focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
																"transition-shadow duration-200",
															)}
														/>
													</div>

													{/* Cover Image */}
													<div className="space-y-2">
														<span className="text-sm font-medium text-foreground">
															封面图片
														</span>
														{articleCoverImage ? (
															<div className="relative group rounded-lg overflow-hidden">
																<img
																	src={articleCoverImage}
																	alt="封面"
																	className="w-full aspect-video object-cover"
																/>
																<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
																	<ImageUploader
																		mode="single"
																		value={[articleCoverImage]}
																		onChange={handleCoverChange}
																		compact
																	/>
																</div>
															</div>
														) : (
															<ImageUploader
																mode="single"
																value={[]}
																onChange={handleCoverChange}
																placeholder="添加封面图片"
															/>
														)}
													</div>
												</>
											)}

											{/* Snippet Title */}
											{activeType === "SNIPPET" && (
												<div className="space-y-2">
													<span className="text-sm font-medium text-foreground">
														标题（可选）
													</span>
													<input
														type="text"
														value={snippetTitle}
														onChange={(e) => setSnippetTitle(e.target.value)}
														placeholder="代码片段标题..."
														className={cn(
															"w-full rounded-lg border border-input bg-background",
															"px-3 py-2.5 text-sm",
															"placeholder:text-muted-foreground",
															"focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
															"transition-shadow duration-200",
														)}
													/>
												</div>
											)}

											{/* Tags */}
											<div className="space-y-2">
												<TagInput
													tags={tags}
													onChange={setTags}
													suggestions={tagSuggestions}
												/>
											</div>

											{/* Attachments */}
											<div className="space-y-2">
												<span className="text-sm font-medium text-foreground">
													附件
												</span>
												<FileUploader
													value={attachments}
													onChange={setAttachments}
												/>
											</div>

											{/* Private Toggle */}
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Lock className="h-4 w-4 text-muted-foreground" />
														<span className="text-sm font-medium text-foreground">
															私密帖子
														</span>
													</div>
													<button
														type="button"
														onClick={() => setIsPrivate(!isPrivate)}
														className={cn(
															"relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
															isPrivate ? "bg-primary" : "bg-input",
														)}
													>
														<span
															className={cn(
																"pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition-transform",
																isPrivate ? "translate-x-5" : "translate-x-0",
															)}
														/>
													</button>
												</div>
												{isPrivate && (
													<Input
														type="password"
														placeholder="输入访问密码"
														value={password}
														onChange={(e) => setPassword(e.target.value)}
														className="mt-2"
													/>
												)}
											</div>
										</div>

										{/* Publish Actions */}
										<div className="border-t border-border p-5 space-y-3 bg-background/50">
											{error && (
												<div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
													{isEditMode ? "保存失败" : "发布失败"}：{error}
												</div>
											)}
											<Button
												onClick={handlePublish}
												disabled={!canPublish() || isPublishing}
												className="w-full h-11"
											>
												{buttonText}
											</Button>
											<Button
												variant="outline"
												onClick={handleClose}
												className="w-full h-11"
											>
												取消
											</Button>
										</div>
									</div>
								</div>

								{/* Mobile/Tablet Bottom Bar (when sidebar hidden) */}
								<div className="lg:hidden border-t border-border px-4 py-3 shrink-0 bg-background">
									{error && (
										<div className="mb-3 p-2 text-sm text-red-600 bg-red-50 rounded-lg">
											{isEditMode ? "保存失败" : "发布失败"}：{error}
										</div>
									)}
									<div className="flex items-center gap-3">
										<div className="flex-1 min-w-0">
											<TagInput
												tags={tags}
												onChange={setTags}
												suggestions={tagSuggestions}
											/>
										</div>
										<Button
											onClick={handlePublish}
											disabled={!canPublish() || isPublishing}
											className="shrink-0"
										>
											{buttonText}
										</Button>
									</div>
								</div>
							</div>
						</DialogPrimitive.Popup>
					</DialogPrimitive.Portal>
				</DialogPrimitive.Root>

				{/* Restore Draft Modal */}
				<RestoreDraftModal
					open={showRestorePrompt}
					draft={pendingDraft}
					onRestore={handleRestoreDraft}
					onDiscard={handleDiscardDraft}
				/>
			</>
		);
	}

	// Standard modal layout (mobile + desktop non-fullscreen)
	return (
		<>
			<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
				<DialogPrimitive.Portal>
					<DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity" />
					<DialogPrimitive.Popup
						className={cn(
							"fixed z-50 bg-card shadow-lg",
							"data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
							"data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
							"transition-all duration-200",
							"flex flex-col",
							// Mobile: always fullscreen
							"inset-0 rounded-none",
							// Desktop: centered modal
							"sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl sm:max-h-[85vh] sm:rounded-xl",
						)}
					>
						{/* Header */}
						<div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
							<DialogPrimitive.Title className="text-lg font-semibold">
								{modalTitle}
							</DialogPrimitive.Title>
							<div className="flex items-center gap-1">
								{/* Fullscreen toggle - desktop only */}
								<button
									type="button"
									onClick={() => setIsFullscreen(true)}
									className={cn(
										"hidden sm:flex",
										"h-9 w-9 items-center justify-center rounded-lg",
										"text-muted-foreground hover:bg-muted hover:text-foreground",
										"transition-colors",
									)}
									title="全屏编辑"
								>
									<Maximize2 className="h-4 w-4" />
								</button>
								<DialogPrimitive.Close
									className="rounded-lg p-2 hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
									onClick={handleClose}
								>
									<X className="h-5 w-5" />
								</DialogPrimitive.Close>
							</div>
						</div>

						{!isEditMode && (
							<div className="flex border-b border-border shrink-0">
								{TABS.map(({ type, icon: Icon, label }) => (
									<button
										key={type}
										type="button"
										onClick={() => setActiveType(type)}
										className={cn(
											"flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors min-h-[48px]",
											activeType === type
												? "border-b-2 border-primary text-primary"
												: "text-muted-foreground hover:text-foreground",
										)}
									>
										<Icon className="h-4 w-4" />
										{label}
									</button>
								))}
							</div>
						)}

						<div className="flex-1 overflow-y-auto p-4 min-h-0">
							{activeType === "MOMENT" && (
								<MomentEditor
									content={momentContent}
									onChange={setMomentContent}
									images={momentImages}
									onImagesChange={setMomentImages}
								/>
							)}

							{activeType === "SNIPPET" && (
								<SnippetEditor
									title={snippetTitle}
									onTitleChange={setSnippetTitle}
									code={snippetCode}
									onCodeChange={setSnippetCode}
									language={snippetLanguage}
									onLanguageChange={setSnippetLanguage}
								/>
							)}

							{activeType === "ARTICLE" && (
								<ArticleEditor
									title={articleTitle}
									onTitleChange={setArticleTitle}
									content={articleContent}
									onContentChange={setArticleContent}
									coverImage={articleCoverImage}
									onCoverImageChange={setArticleCoverImage}
								/>
							)}

							{/* Tags */}
							<div className="mt-4 border-t border-border pt-4">
								<TagInput
									tags={tags}
									onChange={setTags}
									suggestions={tagSuggestions}
								/>
							</div>

							{/* Attachments */}
							<div className="mt-4">
								<FileUploader value={attachments} onChange={setAttachments} />
							</div>

							{/* Private Toggle */}
							<div className="mt-4 border-t border-border pt-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Lock className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm font-medium text-foreground">
											设为私密
										</span>
									</div>
									<button
										type="button"
										onClick={() => setIsPrivate(!isPrivate)}
										className={cn(
											"relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
											isPrivate ? "bg-primary" : "bg-input",
										)}
									>
										<span
											className={cn(
												"pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition-transform",
												isPrivate ? "translate-x-5" : "translate-x-0",
											)}
										/>
									</button>
								</div>
								{isPrivate && (
									<Input
										type="password"
										placeholder="输入访问密码"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="mt-3"
									/>
								)}
							</div>
						</div>

						<div className="border-t border-border px-4 py-3 shrink-0">
							{error && (
								<div className="mb-3 p-2 text-sm text-red-600 bg-red-50 rounded-lg">
									{isEditMode ? "保存失败" : "发布失败"}：{error}
								</div>
							)}
							<div className="flex items-center justify-end gap-2">
								<Button
									variant="outline"
									onClick={handleClose}
									className="min-h-[44px] px-4"
								>
									取消
								</Button>
								<Button
									onClick={handlePublish}
									disabled={!canPublish() || isPublishing}
									className="min-h-[44px] px-4"
								>
									{buttonText}
								</Button>
							</div>
						</div>
					</DialogPrimitive.Popup>
				</DialogPrimitive.Portal>
			</DialogPrimitive.Root>

			{/* Restore Draft Modal */}
			<RestoreDraftModal
				open={showRestorePrompt}
				draft={pendingDraft}
				onRestore={handleRestoreDraft}
				onDiscard={handleDiscardDraft}
			/>
		</>
	);
}
