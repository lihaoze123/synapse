import { cn } from "@/lib/utils";

interface ArticleEditorProps {
	title: string;
	onTitleChange: (title: string) => void;
	content: string;
	onContentChange: (content: string) => void;
	className?: string;
}

export default function ArticleEditor({
	title,
	onTitleChange,
	content,
	onContentChange,
	className,
}: ArticleEditorProps) {
	return (
		<div className={cn("space-y-3", className)}>
			{/* Title */}
			<input
				type="text"
				value={title}
				onChange={(e) => onTitleChange(e.target.value)}
				placeholder="文章标题"
				className="w-full rounded-lg border border-input bg-background px-3 py-2 text-lg font-semibold placeholder:text-muted-foreground placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-ring"
			/>

			{/* Markdown content */}
			<div className="space-y-1">
				<textarea
					value={content}
					onChange={(e) => onContentChange(e.target.value)}
					placeholder="使用 Markdown 撰写文章内容..."
					rows={16}
					className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
				/>
				<p className="text-xs text-muted-foreground">支持 Markdown 语法</p>
			</div>
		</div>
	);
}
