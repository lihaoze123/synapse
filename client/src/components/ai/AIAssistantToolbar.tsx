import { Loader2, Sparkles, Wand2 } from "lucide-react";
import type { RefObject } from "react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
				"flex items-center gap-1.5 overflow-x-auto",
				"px-2 py-1.5",
				"border-l border-border/60",
				className,
			)}
		>
			{getActions().map((actionConfig) => {
				const Icon = actionConfig.icon;
				const isExplain = actionConfig.action === "explain";

				return (
					<Button
						key={actionConfig.action}
						variant="ghost"
						size="sm"
						disabled={disabled || isLoading}
						onClick={() => handleAction(actionConfig)}
						className={cn(
							"h-8 gap-1.5 px-2.5 text-xs font-medium",
							"text-muted-foreground",
							"hover:text-primary hover:bg-primary/5",
							"disabled:opacity-50",
							isExplain &&
								"text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300",
						)}
						title={`${actionConfig.label} (${actionConfig.shortcut})`}
					>
						{isLoading ? (
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
						) : (
							<Icon className="h-3.5 w-3.5" />
						)}
						<span className="hidden sm:inline">{actionConfig.label}</span>
					</Button>
				);
			})}
		</div>
	);
}
