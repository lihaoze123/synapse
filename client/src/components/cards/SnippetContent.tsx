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
			<div className="rounded overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
				<CodeBlock
					code={content}
					language={language || "plaintext"}
					maxLines={6}
				/>
			</div>
		</div>
	);
}
