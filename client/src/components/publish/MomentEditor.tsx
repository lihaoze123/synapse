import { useRef } from "react";
import EmojiPicker from "@/components/editor/EmojiPicker";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { cn } from "@/lib/utils";

interface MomentEditorProps {
	content: string;
	onChange: (content: string) => void;
	images?: string[];
	onImagesChange?: (images: string[]) => void;
	maxLength?: number;
	className?: string;
}

export default function MomentEditor({
	content,
	onChange,
	images = [],
	onImagesChange,
	maxLength = 500,
	className,
}: MomentEditorProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleEmojiSelect = (emoji: string) => {
		const textarea = textareaRef.current;
		if (!textarea) {
			onChange((content + emoji).slice(0, maxLength));
			return;
		}

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const newContent =
			content.substring(0, start) + emoji + content.substring(end);

		onChange(newContent.slice(0, maxLength));

		setTimeout(() => {
			textarea.focus();
			const newCursorPos = start + emoji.length;
			textarea.setSelectionRange(newCursorPos, newCursorPos);
		}, 0);
	};

	const percentage = (content.length / maxLength) * 100;
	const isNearLimit = content.length > maxLength * 0.9;

	return (
		<div className={cn("space-y-4", className)}>
			<div className="relative">
				<textarea
					ref={textareaRef}
					value={content}
					onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
					placeholder="分享你的想法..."
					rows={5}
					className={cn(
						"w-full resize-none rounded-lg border border-input bg-background",
						"px-3.5 py-3 text-base leading-relaxed",
						"placeholder:text-muted-foreground",
						"focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
						"transition-shadow duration-200",
					)}
				/>
			</div>

			<div className="flex items-center justify-between">
				<EmojiPicker onSelect={handleEmojiSelect} />

				<div className="flex items-center gap-2">
					<div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-muted">
						<div
							className={cn(
								"absolute left-0 top-0 h-full rounded-full transition-all duration-300",
								isNearLimit ? "bg-destructive" : "bg-primary/60",
							)}
							style={{ width: `${Math.min(percentage, 100)}%` }}
						/>
					</div>
					<span
						className={cn(
							"text-xs tabular-nums",
							isNearLimit ? "text-destructive" : "text-muted-foreground",
						)}
					>
						{content.length}/{maxLength}
					</span>
				</div>
			</div>

			<div className="space-y-2">
				<span className="text-sm font-medium text-muted-foreground">
					添加图片（最多 9 张）
				</span>
				<ImageUploader
					mode="multiple"
					maxFiles={9}
					value={images}
					onChange={onImagesChange}
				/>
			</div>
		</div>
	);
}
