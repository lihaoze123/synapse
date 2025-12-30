import { cn } from "@/lib/utils";

interface MomentEditorProps {
	content: string;
	onChange: (content: string) => void;
	maxLength?: number;
	className?: string;
}

export default function MomentEditor({
	content,
	onChange,
	maxLength = 500,
	className,
}: MomentEditorProps) {
	return (
		<div className={cn("space-y-2", className)}>
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
		</div>
	);
}
