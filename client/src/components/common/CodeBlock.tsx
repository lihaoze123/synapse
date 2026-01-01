import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	oneDark,
	oneLight,
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

type LanguageModule = { default: unknown };

const languageLoaders: Record<string, () => Promise<LanguageModule>> = {
	bash: () => import("react-syntax-highlighter/dist/esm/languages/prism/bash"),
	c: () => import("react-syntax-highlighter/dist/esm/languages/prism/c"),
	cpp: () => import("react-syntax-highlighter/dist/esm/languages/prism/cpp"),
	csharp: () =>
		import("react-syntax-highlighter/dist/esm/languages/prism/csharp"),
	css: () => import("react-syntax-highlighter/dist/esm/languages/prism/css"),
	go: () => import("react-syntax-highlighter/dist/esm/languages/prism/go"),
	html: () =>
		import("react-syntax-highlighter/dist/esm/languages/prism/markup"),
	java: () => import("react-syntax-highlighter/dist/esm/languages/prism/java"),
	javascript: () =>
		import("react-syntax-highlighter/dist/esm/languages/prism/javascript"),
	json: () => import("react-syntax-highlighter/dist/esm/languages/prism/json"),
	kotlin: () =>
		import("react-syntax-highlighter/dist/esm/languages/prism/kotlin"),
	markdown: () =>
		import("react-syntax-highlighter/dist/esm/languages/prism/markdown"),
	php: () => import("react-syntax-highlighter/dist/esm/languages/prism/php"),
	python: () =>
		import("react-syntax-highlighter/dist/esm/languages/prism/python"),
	ruby: () => import("react-syntax-highlighter/dist/esm/languages/prism/ruby"),
	rust: () => import("react-syntax-highlighter/dist/esm/languages/prism/rust"),
	sql: () => import("react-syntax-highlighter/dist/esm/languages/prism/sql"),
	swift: () =>
		import("react-syntax-highlighter/dist/esm/languages/prism/swift"),
	typescript: () =>
		import("react-syntax-highlighter/dist/esm/languages/prism/typescript"),
	yaml: () => import("react-syntax-highlighter/dist/esm/languages/prism/yaml"),
};

const registered = new Set<string>();

export default function CodeBlock({
	code,
	language = "text",
	showLineNumbers = false,
	maxLines = 10,
	className,
}: CodeBlockProps) {
	const [copied, setCopied] = useState(false);
	const [languageReady, setLanguageReady] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const displayLanguage =
		LANGUAGE_LABELS[language.toLowerCase()] || language.toUpperCase();

	const highlightLanguage =
		LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase();
	const loader = languageLoaders[highlightLanguage];

	useEffect(() => {
		let mounted = true;
		if (!loader || registered.has(highlightLanguage)) {
			setLanguageReady(true);
			return;
		}

		loader()
			.then((module) => {
				if (!mounted) return;
				SyntaxHighlighter.registerLanguage(
					highlightLanguage,
					module.default as never,
				);
				registered.add(highlightLanguage);
				setLanguageReady(true);
			})
			.catch(() => {
				if (mounted) setLanguageReady(true);
			});

		return () => {
			mounted = false;
		};
	}, [highlightLanguage, loader]);

	const normalizedCode = code.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	const lines = normalizedCode.split("\n");
	const truncated = lines.length > maxLines;
	const displayCode = truncated
		? lines.slice(0, maxLines).join("\n")
		: normalizedCode;

	const isDark = document?.documentElement.classList.contains("dark");

	const customStyle = {
		margin: 0,
		padding: "0.75rem",
		fontSize: "13px",
		lineHeight: "1.5",
		background: "transparent",
	};

	return (
		<div className={cn("group relative", className)}>
			<div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900">
				<div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5">
					<span className="text-xs font-medium text-black/60 dark:text-white/60">
						{displayLanguage}
					</span>
					<button
						type="button"
						onClick={handleCopy}
						className="flex items-center gap-1 rounded px-2 py-1 text-[11px] sm:text-xs text-black/60 dark:text-white/60 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white min-h-[32px]"
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

				<div className="overflow-x-auto">
					{languageReady ? (
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
					) : (
						<pre className="px-3 py-2 text-sm text-foreground/80">
							{String(displayCode).trim()}
						</pre>
					)}
				</div>

				{truncated && (
					<div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 text-center">
						<span className="text-xs text-black/50 dark:text-white/50">
							... 还有 {lines.length - maxLines} 行
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
