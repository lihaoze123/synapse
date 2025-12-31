import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { cn } from "@/lib/utils";

interface ArticleEditorProps {
	title: string;
	onTitleChange: (title: string) => void;
	content: string;
	onContentChange: (content: string) => void;
	coverImage?: string;
	onCoverImageChange?: (url: string | undefined) => void;
	className?: string;
}

export default function ArticleEditor({
	title,
	onTitleChange,
	content,
	onContentChange,
	coverImage,
	onCoverImageChange,
	className,
}: ArticleEditorProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [imageDialogOpen, setImageDialogOpen] = useState(false);

	const handleCoverChange = (urls: string[]) => {
		onCoverImageChange?.(urls[0] || undefined);
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

	return (
		<div className={cn("space-y-3", className)}>
			{/* Cover Image */}
			<div className="space-y-1.5">
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
				className="w-full rounded-lg border border-input bg-background px-3 py-2 text-lg font-semibold placeholder:text-muted-foreground placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-ring"
			/>

			{/* Markdown content with toolbar */}
			<div className="space-y-1">
				<div className="flex items-center gap-1 rounded-t-lg border border-b-0 border-input bg-muted/30 px-2 py-1">
					<DialogPrimitive.Root
						open={imageDialogOpen}
						onOpenChange={setImageDialogOpen}
					>
						<DialogPrimitive.Trigger
							className="flex items-center gap-1 rounded px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
							title="插入图片"
						>
							<ImagePlus className="h-4 w-4" />
							<span>插入图片</span>
						</DialogPrimitive.Trigger>
						<DialogPrimitive.Portal>
							<DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50" />
							<DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-4 shadow-lg">
								<div className="flex items-center justify-between mb-4">
									<DialogPrimitive.Title className="text-lg font-semibold">
										插入图片
									</DialogPrimitive.Title>
									<DialogPrimitive.Close className="rounded-lg p-1 hover:bg-muted transition-colors">
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
				<textarea
					ref={textareaRef}
					value={content}
					onChange={(e) => onContentChange(e.target.value)}
					placeholder="使用 Markdown 撰写文章内容..."
					rows={12}
					className="w-full resize-none rounded-b-lg rounded-t-none border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
				/>
				<p className="text-xs text-muted-foreground">支持 Markdown 语法</p>
			</div>
		</div>
	);
}
