import { CodeBlock } from "@/components/common";

interface SnippetContentProps {
	title?: string | null;
	content: string;
	language?: string | null;
}

export default function SnippetContent({
	title,
	content,
	language,
}: SnippetContentProps) {
	return (
		<div className="space-y-3">
			{title && (
				<p className="text-sm text-muted-foreground font-medium">{title}</p>
			)}
			<div className="rounded-lg overflow-hidden ring-1 ring-border/40">
				<CodeBlock
					code={content}
					language={language || "plaintext"}
					maxLines={10}
				/>
			</div>
		</div>
	);
}
