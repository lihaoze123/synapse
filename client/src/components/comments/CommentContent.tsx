import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import CodeBlock from "@/components/common/CodeBlock";
import { cn } from "@/lib/utils";

interface CommentContentProps {
	content: string;
	className?: string;
	collapsedHeight?: number;
}

// 处理 @mentions 的正则表达式 - 匹配 @username 格式
const AT_MENTION_REGEX = /@([a-zA-Z0-9_-]+)/g;

// 递归处理 ReactNode 中的所有文本节点
function processNodeWithAtMentions(node: ReactNode): ReactNode {
	if (typeof node === "string") {
		return processAtMentionsInText(node);
	}
	if (Array.isArray(node)) {
		return node.map((child, _i) => processNodeWithAtMentions(child));
	}
	return node;
}

// 在文本中处理 @mentions
function processAtMentionsInText(text: string): ReactNode {
	const parts: ReactNode[] = [];
	let lastIndex = 0;

	const matches = Array.from(text.matchAll(AT_MENTION_REGEX));

	for (const match of matches) {
		const { index = 0 } = match;
		const username = match[1];
		const fullMatch = match[0];

		// 添加匹配前的文本
		if (index > lastIndex) {
			parts.push(text.slice(lastIndex, index));
		}

		parts.push(
			<Link
				key={`mention-${index}-${username}`}
				to="/u/$username"
				params={{ username }}
				className="text-primary font-medium hover:underline"
			>
				{fullMatch}
			</Link>,
		);

		lastIndex = index + fullMatch.length;
	}

	// 添加剩余文本
	if (lastIndex < text.length) {
		parts.push(text.slice(lastIndex));
	}

	// 如果没有匹配，返回原文本
	if (parts.length === 0) return text;
	if (parts.length === 1) return parts[0];

	return <>{parts}</>;
}

export default function CommentContent({
	content,
	className,
	collapsedHeight = 200,
}: CommentContentProps) {
	const contentRef = useRef<HTMLDivElement>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [needsExpansion, setNeedsExpansion] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: content changes need to trigger height recalculation
	useEffect(() => {
		if (contentRef.current) {
			setNeedsExpansion(contentRef.current.scrollHeight > collapsedHeight);
		}
	}, [content, collapsedHeight]);

	return (
		<div className="relative">
			<div
				ref={contentRef}
				className={cn(
					"prose prose-sm max-w-none dark:prose-invert",
					"prose-p:my-1.5 prose-p:leading-relaxed",
					"prose-pre:my-2 prose-pre:p-0 prose-pre:bg-transparent",
					"prose-code:before:content-none prose-code:after:content-none",
					"prose-ul:my-1.5 prose-ol:my-1.5",
					"prose-blockquote:my-2 prose-blockquote:py-0.5",
					"overflow-hidden transition-all duration-300",
					className,
				)}
				style={{
					maxHeight:
						needsExpansion && !isExpanded ? `${collapsedHeight}px` : undefined,
				}}
			>
				<ReactMarkdown
					remarkPlugins={[remarkGfm, remarkMath]}
					rehypePlugins={[rehypeKatex]}
					components={{
						p({ children }) {
							return <p>{processNodeWithAtMentions(children)}</p>;
						},
						li({ children }) {
							return <li>{processNodeWithAtMentions(children)}</li>;
						},
						blockquote({ children }) {
							return (
								<blockquote>{processNodeWithAtMentions(children)}</blockquote>
							);
						},
						strong({ children }) {
							return <strong>{processNodeWithAtMentions(children)}</strong>;
						},
						em({ children }) {
							return <em>{processNodeWithAtMentions(children)}</em>;
						},
						td({ children }) {
							return <td>{processNodeWithAtMentions(children)}</td>;
						},
						th({ children }) {
							return <th>{processNodeWithAtMentions(children)}</th>;
						},
						code({ className, children, ...props }) {
							const match = /language-(\w+)/.exec(className || "");
							const isInline = !match;

							if (isInline) {
								return (
									<code
										className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs"
										{...props}
									>
										{children}
									</code>
								);
							}

							const code = String(children).replace(/\n$/, "");
							return (
								<CodeBlock code={code} language={match[1]} maxLines={9999} />
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
									className="rounded-lg max-w-full h-auto max-h-[300px] object-contain"
									loading="lazy"
								/>
							);
						},
					}}
				>
					{content}
				</ReactMarkdown>
			</div>

			{needsExpansion && !isExpanded && (
				<div className="absolute bottom-6 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
			)}

			{needsExpansion && (
				<button
					type="button"
					onClick={() => setIsExpanded(!isExpanded)}
					className={cn(
						"relative z-10 flex items-center gap-1 text-xs font-medium transition-colors",
						"text-muted-foreground/80 hover:text-foreground",
						"mt-2",
					)}
				>
					{isExpanded ? (
						<>
							<ChevronUp className="h-3.5 w-3.5" />
							收起
						</>
					) : (
						<>
							<ChevronDown className="h-3.5 w-3.5" />
							展开全部
						</>
					)}
				</button>
			)}
		</div>
	);
}
