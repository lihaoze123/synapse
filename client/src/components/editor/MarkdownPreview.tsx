import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "@/components/common/CodeBlock";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
	content: string;
	className?: string;
}

export default function MarkdownPreview({
	content,
	className,
}: MarkdownPreviewProps) {
	if (!content.trim()) {
		return (
			<div
				className={cn(
					"flex items-center justify-center text-muted-foreground text-sm py-12",
					className,
				)}
			>
				暂无内容预览
			</div>
		);
	}

	return (
		<div
			className={cn("prose prose-sm max-w-none dark:prose-invert", className)}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					code({ className, children, ...props }) {
						const match = /language-(\w+)/.exec(className || "");
						const isInline = !match;

						if (isInline) {
							return (
								<code
									className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
									{...props}
								>
									{children}
								</code>
							);
						}

						return (
							<CodeBlock
								code={String(children).replace(/\n$/, "")}
								language={match[1]}
							/>
						);
					},
					a({ href, children }) {
						return (
							<a
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								{children}
							</a>
						);
					},
					img({ src, alt }) {
						return (
							<img
								src={src}
								alt={alt || ""}
								className="rounded-lg max-w-full h-auto"
								loading="lazy"
							/>
						);
					},
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
