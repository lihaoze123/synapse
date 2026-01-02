import CodeMirrorEditor from "@/components/editor/CodeMirrorEditor";
import { cn } from "@/lib/utils";

interface SnippetEditorProps {
	title: string;
	onTitleChange: (title: string) => void;
	code: string;
	onCodeChange: (code: string) => void;
	language: string;
	onLanguageChange: (language: string) => void;
	isFullscreen?: boolean;
	className?: string;
}

const LANGUAGES = [
	{ value: "javascript", label: "JavaScript" },
	{ value: "typescript", label: "TypeScript" },
	{ value: "java", label: "Java" },
	{ value: "python", label: "Python" },
	{ value: "go", label: "Go" },
	{ value: "rust", label: "Rust" },
	{ value: "c", label: "C" },
	{ value: "cpp", label: "C++" },
	{ value: "csharp", label: "C#" },
	{ value: "php", label: "PHP" },
	{ value: "ruby", label: "Ruby" },
	{ value: "swift", label: "Swift" },
	{ value: "kotlin", label: "Kotlin" },
	{ value: "sql", label: "SQL" },
	{ value: "html", label: "HTML" },
	{ value: "css", label: "CSS" },
	{ value: "json", label: "JSON" },
	{ value: "yaml", label: "YAML" },
	{ value: "bash", label: "Bash" },
	{ value: "markdown", label: "Markdown" },
];

export default function SnippetEditor({
	title,
	onTitleChange,
	code,
	onCodeChange,
	language,
	onLanguageChange,
	isFullscreen = false,
	className,
}: SnippetEditorProps) {
	// Desktop fullscreen: Full-height code editor (title in sidebar)
	if (isFullscreen) {
		return (
			<div className={cn("flex flex-col h-full", className)}>
				{/* Language Selector */}
				<div className="flex items-center justify-between mb-4">
					<span className="text-sm text-muted-foreground">编写代码</span>
					<div className="relative shrink-0">
						<select
							value={language}
							onChange={(e) => onLanguageChange(e.target.value)}
							className={cn(
								"appearance-none rounded-lg border border-input bg-background",
								"px-3 py-2 pr-8 text-sm font-medium",
								"focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
								"transition-shadow duration-200 cursor-pointer",
							)}
						>
							{LANGUAGES.map(({ value, label }) => (
								<option key={value} value={value}>
									{label}
								</option>
							))}
						</select>
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
							<svg
								className="h-4 w-4 text-muted-foreground"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</div>
					</div>
				</div>

				{/* Code Editor - Full Height */}
				<div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-input">
					<CodeMirrorEditor
						value={code}
						onChange={onCodeChange}
						language={language}
						placeholder="在此输入代码..."
						minHeight="100%"
						className="h-full"
					/>
				</div>
			</div>
		);
	}

	// Standard layout (mobile + modal)
	return (
		<div className={cn("flex flex-col gap-4", className)}>
			<div className="flex flex-col gap-3 sm:flex-row">
				<input
					type="text"
					value={title}
					onChange={(e) => onTitleChange(e.target.value)}
					placeholder="标题（可选）"
					className={cn(
						"flex-1 rounded-lg border border-input bg-background px-3.5 py-2.5",
						"text-sm placeholder:text-muted-foreground",
						"focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
						"transition-shadow duration-200",
					)}
				/>

				<div className="relative sm:w-40">
					<select
						value={language}
						onChange={(e) => onLanguageChange(e.target.value)}
						className={cn(
							"w-full appearance-none rounded-lg border border-input bg-background",
							"px-3.5 py-2.5 pr-10 text-sm",
							"focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
							"transition-shadow duration-200 cursor-pointer",
						)}
					>
						{LANGUAGES.map(({ value, label }) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</select>
					<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
						<svg
							className="h-4 w-4 text-muted-foreground"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</div>
				</div>
			</div>

			<CodeMirrorEditor
				value={code}
				onChange={onCodeChange}
				language={language}
				placeholder="在此输入代码..."
				minHeight="280px"
			/>
		</div>
	);
}
