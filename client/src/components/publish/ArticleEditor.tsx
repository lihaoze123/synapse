import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { AIAssistantToolbar, AIPreviewModal } from "@/components/ai";
import MarkdownPreview from "@/components/editor/MarkdownPreview";
import MarkdownToolbar from "@/components/editor/MarkdownToolbar";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { useAIPreview } from "@/hooks";
import { cn } from "@/lib/utils";

interface ArticleEditorProps {
	title: string;
	onTitleChange: (title: string) => void;
	content: string;
	onContentChange: (content: string) => void;
	coverImage?: string;
	onCoverImageChange?: (url: string | undefined) => void;
	isFullscreen?: boolean;
	className?: string;
}

type TabType = "edit" | "preview";

export default function ArticleEditor({
	title,
	onTitleChange,
	content,
	onContentChange,
	coverImage,
	onCoverImageChange,
	isFullscreen = false,
	className,
}: ArticleEditorProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [imageDialogOpen, setImageDialogOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<TabType>("edit");

	const {
		preview: aiPreview,
		generate: aiGenerate,
		applySuggestion: aiApply,
		closePreview: aiClose,
		retry: aiRetry,
	} = useAIPreview();

	const handleCoverChange = (urls: string[]) => {
		onCoverImageChange?.(urls[0] || undefined);
	};

	const handleAIAction = (
		action: typeof aiPreview.action,
		selectedContent: string,
	) => {
		aiGenerate(action, selectedContent);
	};

	const handleAIApply = () => {
		aiApply((suggestion) => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const currentContent = content;

			if (start === end) {
				onContentChange(suggestion);
			} else {
				const newContent =
					currentContent.substring(0, start) +
					suggestion +
					currentContent.substring(end);
				onContentChange(newContent);
			}
		});
	};

	const insertImageAtCursor = (url: string) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const markdown = `![](${url})`;

		const newContent =
			content.substring(0, start) + markdown + content.substring(end);
		onContentChange(newContent);

		setTimeout(() => {
			textarea.focus();
			const newCursorPos = start + markdown.length;
			textarea.setSelectionRange(newCursorPos, newCursorPos);
		}, 0);
	};

	const handleImageUpload = (urls: string[]) => {
		if (urls.length > 0) {
			insertImageAtCursor(urls[0]);
			setImageDialogOpen(false);
		}
	};

	const tabs: { key: TabType; label: string }[] = [
		{ key: "edit", label: "编辑" },
		{ key: "preview", label: "预览" },
	];

	const insertMarkdown = (
		prefix: string,
		suffix: string,
		placeholder: string,
	) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = content.substring(start, end);

		const textToWrap = selectedText || placeholder;
		const newText = `${prefix}${textToWrap}${suffix}`;
		const newContent =
			content.substring(0, start) + newText + content.substring(end);
		onContentChange(newContent);

		setTimeout(() => {
			textarea.focus();
			if (selectedText) {
				textarea.setSelectionRange(
					start + newText.length,
					start + newText.length,
				);
			} else {
				textarea.setSelectionRange(
					start + prefix.length,
					start + prefix.length + placeholder.length,
				);
			}
		}, 0);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
		const modKey = isMac ? e.metaKey : e.ctrlKey;

		if (!modKey) {
			// Handle Tab when no modifier key
			if (e.key === "Tab") {
				e.preventDefault();
				const textarea = e.currentTarget;
				const start = textarea.selectionStart;
				const end = textarea.selectionEnd;

				const newContent = `${content.substring(0, start)}\t${content.substring(end)}`;
				onContentChange(newContent);

				setTimeout(() => {
					textarea.selectionStart = textarea.selectionEnd = start + 1;
				}, 0);
			}
			return;
		}

		// Markdown shortcuts with Ctrl/Cmd
		switch (e.key) {
			case "b":
				e.preventDefault();
				insertMarkdown("**", "**", "粗体文字");
				break;
			case "i":
				e.preventDefault();
				insertMarkdown("*", "*", "斜体文字");
				break;
			case "k":
				e.preventDefault();
				if (e.shiftKey) {
					insertMarkdown("```\n", "\n```", "代码");
				} else {
					insertMarkdown("[", "](url)", "链接文字");
				}
				break;
			case "m":
				e.preventDefault();
				if (e.shiftKey) {
					insertMarkdown("$$\n", "\n$$", "\\int_0^\\infty e^{-x} dx = 1");
				} else {
					insertMarkdown("$", "$", "E = mc^2");
				}
				break;
		}
	};

	// Desktop fullscreen: Split-pane layout (Editor + Live Preview)
	if (isFullscreen) {
		return (
			<div className={cn("flex flex-col h-full", className)}>
				{/* Split Pane Container */}
				<div className="flex-1 flex min-h-0 gap-6">
					{/* Editor Pane */}
					<div className="flex-1 flex flex-col min-w-0">
						<div className="flex items-stretch">
							<MarkdownToolbar
								textareaRef={textareaRef}
								content={content}
								onContentChange={onContentChange}
								onImageClick={() => setImageDialogOpen(true)}
							/>
							<AIAssistantToolbar
								textareaRef={textareaRef}
								content={content}
								onAction={handleAIAction}
								isLoading={aiPreview.isLoading}
							/>
						</div>
						<textarea
							ref={textareaRef}
							value={content}
							onChange={(e) => onContentChange(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="使用 Markdown 撰写文章内容..."
							data-markdown-editor
							className={cn(
								"flex-1 min-h-0 w-full resize-none",
								"rounded-b-lg rounded-t-none",
								"border border-t-0 border-input bg-background",
								"px-5 py-4 text-[15px] leading-relaxed",
								"placeholder:text-muted-foreground/60",
								"focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
								"transition-shadow duration-200",
							)}
						/>
					</div>

					{/* Live Preview Pane */}
					<div className="hidden xl:flex flex-1 flex-col min-w-0 max-w-2xl">
						<div className="flex items-center h-10 px-4 text-sm font-medium text-muted-foreground border border-border bg-muted/30 rounded-t-lg">
							预览
						</div>
						<div
							className={cn(
								"flex-1 min-h-0 overflow-y-auto",
								"rounded-b-lg border border-t-0 border-input bg-background",
								"p-6",
							)}
						>
							{content ? (
								<article className="prose prose-stone max-w-none">
									<MarkdownPreview content={content} />
								</article>
							) : (
								<div className="flex items-center justify-center h-full text-muted-foreground/50 text-sm">
									在左侧编辑器中输入内容，预览将在此显示
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Image Upload Dialog */}
				<DialogPrimitive.Root
					open={imageDialogOpen}
					onOpenChange={setImageDialogOpen}
				>
					<DialogPrimitive.Portal>
						<DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
						<DialogPrimitive.Popup
							className={cn(
								"fixed left-1/2 top-1/2 z-50 w-full max-w-sm",
								"-translate-x-1/2 -translate-y-1/2",
								"rounded-xl bg-card p-5 shadow-xl",
							)}
						>
							<div className="flex items-center justify-between mb-4">
								<DialogPrimitive.Title className="text-lg font-semibold">
									插入图片
								</DialogPrimitive.Title>
								<DialogPrimitive.Close
									className={cn(
										"rounded-lg p-1.5 -mr-1.5",
										"hover:bg-muted transition-colors",
									)}
								>
									<X className="h-5 w-5" />
								</DialogPrimitive.Close>
							</div>
							<ImageUploader
								mode="single"
								onChange={handleImageUpload}
								placeholder="点击或拖拽上传图片"
							/>
							<div className="mt-4 flex justify-end">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setImageDialogOpen(false)}
								>
									取消
								</Button>
							</div>
						</DialogPrimitive.Popup>
					</DialogPrimitive.Portal>
				</DialogPrimitive.Root>
			</div>
		);
	}

	// Standard layout (mobile + modal)
	return (
		<div className={cn("flex flex-col gap-4", className)}>
			{/* Cover Image */}
			<div className="space-y-2">
				<span className="text-sm font-medium text-muted-foreground">
					封面图片（可选）
				</span>
				<ImageUploader
					mode="single"
					value={coverImage ? [coverImage] : []}
					onChange={handleCoverChange}
					placeholder="点击或拖拽上传封面图片"
				/>
			</div>

			{/* Title */}
			<input
				type="text"
				value={title}
				onChange={(e) => onTitleChange(e.target.value)}
				placeholder="文章标题"
				className={cn(
					"w-full rounded-lg border border-input bg-background",
					"px-3.5 py-2.5 text-lg font-semibold",
					"placeholder:text-muted-foreground placeholder:font-normal",
					"focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
					"transition-shadow duration-200",
				)}
			/>

			{/* Tabs */}
			<div className="flex items-center justify-between border-b border-border">
				<div className="flex gap-1">
					{tabs.map((tab) => (
						<button
							key={tab.key}
							type="button"
							onClick={() => setActiveTab(tab.key)}
							className={cn(
								"relative px-4 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
								activeTab === tab.key
									? "text-primary"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{tab.label}
							{activeTab === tab.key && (
								<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
							)}
						</button>
					))}
				</div>
			</div>

			{/* Content Area */}
			<div className="flex-1 flex flex-col min-h-0">
				{activeTab === "edit" ? (
					<div className="flex flex-col">
						<div className="flex items-stretch">
							<MarkdownToolbar
								textareaRef={textareaRef}
								content={content}
								onContentChange={onContentChange}
								onImageClick={() => setImageDialogOpen(true)}
							/>
							<AIAssistantToolbar
								textareaRef={textareaRef}
								content={content}
								onAction={handleAIAction}
								isLoading={aiPreview.isLoading}
							/>
						</div>
						<textarea
							ref={textareaRef}
							value={content}
							onChange={(e) => onContentChange(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="使用 Markdown 撰写文章内容..."
							rows={10}
							data-markdown-editor
							className={cn(
								"w-full resize-none rounded-b-lg rounded-t-none",
								"border border-t-0 border-input bg-background",
								"px-3.5 py-3 text-sm leading-relaxed",
								"placeholder:text-muted-foreground",
								"focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
								"transition-shadow duration-200",
							)}
						/>
					</div>
				) : (
					<div
						className={cn(
							"rounded-lg border border-input bg-background p-4 overflow-y-auto",
							"min-h-[280px] max-h-[320px]",
						)}
					>
						<MarkdownPreview content={content} />
					</div>
				)}
			</div>

			{/* Image Upload Dialog */}
			<DialogPrimitive.Root
				open={imageDialogOpen}
				onOpenChange={setImageDialogOpen}
			>
				<DialogPrimitive.Portal>
					<DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
					<DialogPrimitive.Popup
						className={cn(
							"fixed left-1/2 top-1/2 z-50 w-full max-w-sm",
							"-translate-x-1/2 -translate-y-1/2",
							"rounded-xl bg-card p-5 shadow-xl",
						)}
					>
						<div className="flex items-center justify-between mb-4">
							<DialogPrimitive.Title className="text-lg font-semibold">
								插入图片
							</DialogPrimitive.Title>
							<DialogPrimitive.Close
								className={cn(
									"rounded-lg p-1.5 -mr-1.5",
									"hover:bg-muted transition-colors",
								)}
							>
								<X className="h-5 w-5" />
							</DialogPrimitive.Close>
						</div>
						<ImageUploader
							mode="single"
							onChange={handleImageUpload}
							placeholder="点击或拖拽上传图片"
						/>
						<div className="mt-4 flex justify-end">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setImageDialogOpen(false)}
							>
								取消
							</Button>
						</div>
					</DialogPrimitive.Popup>
				</DialogPrimitive.Portal>
			</DialogPrimitive.Root>

			<AIPreviewModal
				open={aiPreview.isOpen}
				onOpenChange={aiClose}
				action={aiPreview.action}
				originalContent={aiPreview.originalContent}
				suggestion={aiPreview.suggestion}
				isLoading={aiPreview.isLoading}
				error={aiPreview.error}
				onApply={handleAIApply}
				onRetry={aiRetry}
			/>
		</div>
	);
}
