import { Bold, Code, ImagePlus, Italic, Link, List, Quote } from "lucide-react";
import type { RefObject } from "react";
import { cn } from "@/lib/utils";

interface MarkdownToolbarProps {
	textareaRef: RefObject<HTMLTextAreaElement | null>;
	content: string;
	onContentChange: (content: string) => void;
	onImageClick?: () => void;
	className?: string;
}

interface ToolbarAction {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	prefix: string;
	suffix: string;
	placeholder: string;
	isBlock?: boolean;
}

const actions: ToolbarAction[] = [
	{
		icon: Bold,
		label: "加粗",
		prefix: "**",
		suffix: "**",
		placeholder: "粗体文字",
	},
	{
		icon: Italic,
		label: "斜体",
		prefix: "*",
		suffix: "*",
		placeholder: "斜体文字",
	},
	{
		icon: Link,
		label: "链接",
		prefix: "[",
		suffix: "](url)",
		placeholder: "链接文字",
	},
	{
		icon: Code,
		label: "代码块",
		prefix: "```\n",
		suffix: "\n```",
		placeholder: "代码",
		isBlock: true,
	},
	{
		icon: Quote,
		label: "引用",
		prefix: "> ",
		suffix: "",
		placeholder: "引用文字",
		isBlock: true,
	},
	{
		icon: List,
		label: "列表",
		prefix: "- ",
		suffix: "",
		placeholder: "列表项",
		isBlock: true,
	},
];

export default function MarkdownToolbar({
	textareaRef,
	content,
	onContentChange,
	onImageClick,
	className,
}: MarkdownToolbarProps) {
	const insertMarkdown = (action: ToolbarAction) => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = content.substring(start, end);

		const textToWrap = selectedText || action.placeholder;
		let newText: string;
		let cursorOffset: number;

		if (action.isBlock && start > 0 && content[start - 1] !== "\n") {
			newText = `\n${action.prefix}${textToWrap}${action.suffix}`;
		} else {
			newText = `${action.prefix}${textToWrap}${action.suffix}`;
		}

		const newContent =
			content.substring(0, start) + newText + content.substring(end);
		onContentChange(newContent);

		if (selectedText) {
			cursorOffset = start + newText.length;
		} else {
			cursorOffset =
				start +
				action.prefix.length +
				(action.isBlock && start > 0 && content[start - 1] !== "\n" ? 1 : 0);
		}

		setTimeout(() => {
			textarea.focus();
			if (selectedText) {
				textarea.setSelectionRange(cursorOffset, cursorOffset);
			} else {
				textarea.setSelectionRange(
					cursorOffset,
					cursorOffset + action.placeholder.length,
				);
			}
		}, 0);
	};

	return (
		<div
			className={cn(
				"flex items-center gap-1 overflow-x-auto",
				"rounded-t-lg border border-b-0 border-input",
				"bg-muted/40 px-2 py-1.5",
				className,
			)}
		>
			{actions.map((action) => (
				<button
					key={action.label}
					type="button"
					onClick={() => insertMarkdown(action)}
					title={action.label}
					className={cn(
						"flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
						"text-muted-foreground",
						"hover:bg-background hover:text-foreground hover:shadow-sm",
						"active:scale-95",
						"transition-all duration-150",
						"sm:h-7 sm:w-7",
					)}
				>
					<action.icon className="h-4 w-4" />
				</button>
			))}

			{onImageClick && (
				<>
					<div className="mx-1 h-4 w-px bg-border" />
					<button
						type="button"
						onClick={onImageClick}
						title="插入图片"
						className={cn(
							"flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
							"text-muted-foreground",
							"hover:bg-background hover:text-foreground hover:shadow-sm",
							"active:scale-95",
							"transition-all duration-150",
							"sm:h-7 sm:w-7",
						)}
					>
						<ImagePlus className="h-4 w-4" />
					</button>
				</>
			)}
		</div>
	);
}
