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
		<div className="space-y-2">
			{title && <p className="text-sm text-muted-foreground">{title}</p>}
			<CodeBlock
				code={content}
				language={language || "plaintext"}
				maxLines={10}
			/>
		</div>
	);
}
