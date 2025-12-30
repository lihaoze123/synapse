import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	oneLight,
	oneDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
	code: string;
	language?: string;
	showLineNumbers?: boolean;
	maxLines?: number;
	className?: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
	js: "JavaScript",
	javascript: "JavaScript",
	ts: "TypeScript",
	typescript: "TypeScript",
	tsx: "TSX",
	jsx: "JSX",
	java: "Java",
	python: "Python",
	py: "Python",
	go: "Go",
	rust: "Rust",
	c: "C",
	cpp: "C++",
	csharp: "C#",
	cs: "C#",
	php: "PHP",
	ruby: "Ruby",
	rb: "Ruby",
	swift: "Swift",
	kotlin: "Kotlin",
	sql: "SQL",
	html: "HTML",
	css: "CSS",
	json: "JSON",
	yaml: "YAML",
	yml: "YAML",
	bash: "Bash",
	shell: "Shell",
	sh: "Shell",
	markdown: "Markdown",
	md: "Markdown",
};

// Language mapping for react-syntax-highlighter
const LANGUAGE_MAP: Record<string, string> = {
	js: "javascript",
	ts: "typescript",
	py: "python",
	rb: "ruby",
	cs: "csharp",
	sh: "bash",
	yml: "yaml",
	md: "markdown",
};

export default function CodeBlock({
	code,
	language = "text",
	showLineNumbers = false,
	maxLines = 10,
	className,
}: CodeBlockProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const displayLanguage =
		LANGUAGE_LABELS[language.toLowerCase()] || language.toUpperCase();

	// Map language aliases to their canonical names
	const highlightLanguage =
		LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase();

	// Normalize line endings and limit lines for preview
	const normalizedCode = code.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	const lines = normalizedCode.split("\n");
	const truncated = lines.length > maxLines;
	const displayCode = truncated
		? lines.slice(0, maxLines).join("\n")
		: normalizedCode;

	// Check if dark mode is active
	const isDark =
		typeof document !== "undefined" &&
		document.documentElement.classList.contains("dark");

	const customStyle = {
		margin: 0,
		padding: "0.75rem",
		fontSize: "0.875rem",
		lineHeight: "1.5",
		background: "transparent",
	};

	return (
		<div className={cn("group relative", className)}>
			<div className="overflow-hidden rounded-lg border border-border bg-white dark:bg-zinc-900">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 py-1.5">
					<span className="text-xs font-medium text-black/60 dark:text-white/60">
						{displayLanguage}
					</span>
					<button
						type="button"
						onClick={handleCopy}
						className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-black/60 dark:text-white/60 transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
					>
						{copied ? (
							<>
								<Check className="h-3.5 w-3.5" />
								<span>已复制</span>
							</>
						) : (
							<>
								<Copy className="h-3.5 w-3.5" />
								<span>复制</span>
							</>
						)}
					</button>
				</div>

				{/* Code */}
				<div className="overflow-x-auto">
					<SyntaxHighlighter
						language={highlightLanguage}
						style={isDark ? oneDark : oneLight}
						showLineNumbers={showLineNumbers}
						customStyle={customStyle}
						codeTagProps={{
							style: {
								fontFamily:
									'"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, monospace',
							},
						}}
					>
						{String(displayCode).trim()}
					</SyntaxHighlighter>
				</div>

				{/* Truncation indicator */}
				{truncated && (
					<div className="border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-3 py-1.5 text-center">
						<span className="text-xs text-black/50 dark:text-white/50">
							... 还有 {lines.length - maxLines} 行
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
