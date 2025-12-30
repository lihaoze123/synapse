import {
	transformerNotationDiff,
	transformerNotationFocus,
	transformerNotationHighlight,
} from "@shikijs/transformers";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import ShikiHighlighter from "react-shiki";
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

export default function CodeBlock({
	code,
	language = "plaintext",
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

	// Limit lines for preview
	const lines = code.split("\n");
	const truncated = lines.length > maxLines;
	const displayCode = truncated ? lines.slice(0, maxLines).join("\n") : code;

	return (
		<div className={cn("group relative", className)}>
			<div className="overflow-hidden rounded-lg border border-border bg-[#1e1e1e]">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-1.5">
					<span className="text-xs font-medium text-white/60">
						{displayLanguage}
					</span>
					<button
						type="button"
						onClick={handleCopy}
						className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
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
				<div className="shiki-wrapper overflow-x-auto text-sm">
					<ShikiHighlighter
						language={language}
						theme={{
							light: "github-light",
							dark: "github-dark",
						}}
						defaultColor="dark"
						showLineNumbers={showLineNumbers}
						transformers={[
							transformerNotationDiff(),
							transformerNotationHighlight(),
							transformerNotationFocus(),
						]}
					>
						{displayCode}
					</ShikiHighlighter>
				</div>

				{/* Truncation indicator */}
				{truncated && (
					<div className="border-t border-white/10 bg-white/5 px-3 py-1.5 text-center">
						<span className="text-xs text-white/50">
							... 还有 {lines.length - maxLines} 行
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
