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
	return (
		<div className={cn("space-y-3", className)}>
			<textarea
				value={content}
				onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
				placeholder="分享你的想法..."
				rows={4}
				className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
			/>
			<div className="flex justify-end">
				<span
					className={cn(
						"text-xs",
						content.length > maxLength * 0.9
							? "text-destructive"
							: "text-muted-foreground",
					)}
				>
					{content.length}/{maxLength}
				</span>
			</div>

			{/* Image attachments */}
			<div className="space-y-1.5">
				<span className="text-sm font-medium text-muted-foreground">
					添加图片（最多9张）
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
