import { cn } from "@/lib/utils";

interface SnippetEditorProps {
	title: string;
	onTitleChange: (title: string) => void;
	code: string;
	onCodeChange: (code: string) => void;
	language: string;
	onLanguageChange: (language: string) => void;
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
	className,
}: SnippetEditorProps) {
	return (
		<div className={cn("space-y-3", className)}>
			{/* Title (optional) */}
			<input
				type="text"
				value={title}
				onChange={(e) => onTitleChange(e.target.value)}
				placeholder="标题 (可选)"
				className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
			/>

			{/* Language selector */}
			<select
				value={language}
				onChange={(e) => onLanguageChange(e.target.value)}
				className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
			>
				{LANGUAGES.map(({ value, label }) => (
					<option key={value} value={value}>
						{label}
					</option>
				))}
			</select>

			{/* Code editor */}
			<textarea
				value={code}
				onChange={(e) => onCodeChange(e.target.value)}
				placeholder="粘贴你的代码..."
				rows={12}
				spellCheck={false}
				className="w-full resize-none rounded-lg border border-input bg-[#1e1e1e] px-3 py-2 font-mono text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-ring"
			/>
		</div>
	);
}
