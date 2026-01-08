import { AIPreviewModal } from "@/components/ai";
import CodeMirrorEditor from "@/components/editor/CodeMirrorEditor";
import { useAIPreview } from "@/hooks";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/menu";
import { ChevronDown, Sparkles, Wand2 } from "lucide-react";

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
	const {
		preview: aiPreview,
		generate: aiGenerate,
		applySuggestion: aiApply,
		closePreview: aiClose,
		retry: aiRetry,
	} = useAIPreview();

	const handleAIAction = (
		action: typeof aiPreview.action,
		selectedContent: string,
	) => {
		aiGenerate(action, selectedContent, language);
	};

	const handleAIApply = () => {
		aiApply((suggestion) => {
			onCodeChange(suggestion);
		});
	};

	// Desktop fullscreen: Full-height code editor (title in sidebar)
	if (isFullscreen) {
		return (
			<>
				<div className={cn("flex flex-col h-full", className)}>
					{/* Language Selector */}
					<div className="flex items-center justify-between mb-4">
						<span className="text-sm text-muted-foreground">编写代码</span>
						<div className="flex items-center gap-2">
							<DropdownMenu>
								<DropdownMenuTrigger
									disabled={aiPreview.isLoading}
									className={cn(
										"flex items-center gap-1 rounded-md px-2 h-8 sm:h-7",
										"text-muted-foreground",
										"hover:bg-accent hover:text-foreground",
										"active:scale-95 transition-all duration-150",
									)}
									title="AI 工具"
									aria-label="AI 工具"
								>
									{aiPreview.isLoading ? (
										<svg
											className="h-4 w-4 animate-spin"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
										>
											<circle cx="12" cy="12" r="10" className="opacity-10" />
											<path d="M12 2a10 10 0 0 1 10 10" />
										</svg>
									) : (
										<Sparkles className="h-4 w-4" />
									)}
									<span className="hidden sm:inline text-xs font-medium">AI</span>
									<ChevronDown className="h-3.5 w-3.5 opacity-70" />
                                </DropdownMenuTrigger>
								<DropdownMenuContent align="end" sideOffset={6}>
									<div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
										AI 助手
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => handleAIAction("improve", code)}
									>
										<Wand2 className="opacity-80" />
										润色
										<DropdownMenuShortcut>⌘⇧A</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleAIAction("summarize", code)}
									>
										<Sparkles className="opacity-80" />
										总结
										<DropdownMenuShortcut>⌘⇧S</DropdownMenuShortcut>
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => handleAIAction("explain", code)}
									>
										<Wand2 className="opacity-80" />
										解释
										<DropdownMenuShortcut>⌘⇧E</DropdownMenuShortcut>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
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

				<AIPreviewModal
					open={aiPreview.isOpen}
					onOpenChange={aiClose}
					action={aiPreview.action}
					originalContent={aiPreview.originalContent}
					suggestion={aiPreview.suggestion}
					isLoading={aiPreview.isLoading}
					error={aiPreview.error}
					onApply={handleAIApply}
					onRetry={aiRetry}
				/>
			</>
		);
	}

	// Standard layout (mobile + modal)
	return (
		<>
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

				{/* Bottom AI bar removed for a cleaner code editor layout */}
			</div>

			<AIPreviewModal
				open={aiPreview.isOpen}
				onOpenChange={aiClose}
				action={aiPreview.action}
				originalContent={aiPreview.originalContent}
				suggestion={aiPreview.suggestion}
				isLoading={aiPreview.isLoading}
				error={aiPreview.error}
				onApply={handleAIApply}
				onRetry={aiRetry}
			/>
		</>
	);
}
