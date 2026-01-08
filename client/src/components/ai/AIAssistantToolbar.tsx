import { Loader2, Sparkles, Wand2, ChevronDown } from "lucide-react";
import type { RefObject } from "react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/menu";

export type AIAction = "improve" | "summarize" | "explain";

interface AIAssistantToolbarProps {
	textareaRef: RefObject<HTMLTextAreaElement | null>;
	content: string;
	language?: string;
	onAction: (action: AIAction, content: string, language?: string) => void;
	isLoading?: boolean;
	className?: string;
	disabled?: boolean;
}

interface AIActionConfig {
	icon: typeof Wand2;
	label: string;
	description: string;
	action: AIAction;
	shortcut?: string;
}

const ACTIONS: AIActionConfig[] = [
	{
		icon: Wand2,
		label: "润色",
		description: "改进文字表达",
		action: "improve",
		shortcut: "⌘⇧A",
	},
	{
		icon: Sparkles,
		label: "总结",
		description: "生成内容摘要",
		action: "summarize",
		shortcut: "⌘⇧S",
	},
];

export default function AIAssistantToolbar({
	textareaRef,
	content,
	language,
	onAction,
	isLoading = false,
	className,
	disabled = false,
}: AIAssistantToolbarProps) {
	const [_modKey, _setModKey] = useState("⌘");

	const getActions = useCallback((): AIActionConfig[] => {
		const baseActions = [...ACTIONS];
		if (language) {
			baseActions.push({
				icon: Wand2,
				label: "解释",
				description: `解释${language}代码`,
				action: "explain",
				shortcut: "⌘⇧E",
			});
		}
		return baseActions;
	}, [language]);

	const handleAction = useCallback(
		(actionConfig: AIActionConfig) => {
			const textarea = textareaRef.current;
			let selectedContent = content;

			if (textarea) {
				const start = textarea.selectionStart;
				const end = textarea.selectionEnd;
				if (start !== end) {
					selectedContent = content.substring(start, end);
				}
			}

			if (!selectedContent.trim()) {
				return;
			}

			onAction(actionConfig.action, selectedContent, language);
		},
		[textareaRef, content, language, onAction],
	);

	return (
		<div
			className={cn(
				// Visually attach to MarkdownToolbar: same container; only needs right rounding
				"flex items-center gap-1 bg-muted/40 px-2 py-1.5",
				"border border-input border-l-0 rounded-tr-lg",
				className,
			)}
		>
			{/* Compact AI dropdown trigger */}
			<DropdownMenu>
				<DropdownMenuTrigger
					disabled={disabled || isLoading}
					className={cn(
						"flex items-center gap-1 rounded-md px-2 h-8 sm:h-7",
						"text-muted-foreground",
						"hover:bg-background hover:text-foreground hover:shadow-sm",
						"active:scale-95 transition-all duration-150",
						"disabled:opacity-50",
					)}
					aria-label="AI 工具"
					title="AI 工具"
				>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
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
					{getActions().map((a) => {
						const Icon = a.icon;
						return (
							<DropdownMenuItem
								key={a.action}
								onClick={() => handleAction(a)}
							>
								<Icon className="opacity-80" />
								{a.label}
								{a.shortcut && (
									<DropdownMenuShortcut>{a.shortcut}</DropdownMenuShortcut>
								)}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
