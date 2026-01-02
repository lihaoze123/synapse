import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import MarkdownToolbar from "@/components/editor/MarkdownToolbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import CommentContent from "./CommentContent";

export interface CommentEditorRef {
	focus: () => void;
	scrollIntoView: () => void;
}

interface CommentEditorProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	onCancel?: () => void;
	isSubmitting?: boolean;
	placeholder?: string;
	replyTo?: { floor: number; username: string } | null;
	className?: string;
	maxLength?: number;
}

const CommentEditor = forwardRef<CommentEditorRef, CommentEditorProps>(
	(
		{
			value,
			onChange,
			onSubmit,
			onCancel,
			isSubmitting = false,
			placeholder = "写下你的评论...",
			replyTo,
			className,
			maxLength = 2000,
		},
		ref,
	) => {
		const containerRef = useRef<HTMLDivElement>(null);
		const textareaRef = useRef<HTMLTextAreaElement>(null);
		const [editorHeight, setEditorHeight] = useState(120);

		const rafRef = useRef<number>(0);

		const adjustTextareaHeight = useCallback(() => {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = requestAnimationFrame(() => {
				const textarea = textareaRef.current;
				if (!textarea) return;
				textarea.style.height = "120px";
				const newHeight = Math.max(120, textarea.scrollHeight);
				textarea.style.height = `${newHeight}px`;
				setEditorHeight(newHeight);
			});
		}, []);

		useEffect(() => {
			return () => cancelAnimationFrame(rafRef.current);
		}, []);

		// biome-ignore lint/correctness/useExhaustiveDependencies: need to run when value changes
		useEffect(() => {
			adjustTextareaHeight();
		}, [value, adjustTextareaHeight]);

		useImperativeHandle(ref, () => ({
			focus: () => {
				textareaRef.current?.focus();
			},
			scrollIntoView: () => {
				containerRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
				setTimeout(() => textareaRef.current?.focus(), 300);
			},
		}));

		useEffect(() => {
			const textarea = textareaRef.current;
			if (!textarea) return;

			const handleKeyDown = (e: KeyboardEvent) => {
				const isMod = e.metaKey || e.ctrlKey;

				if (isMod && e.key === "Enter") {
					e.preventDefault();
					if (value.trim() && !isSubmitting) {
						onSubmit();
					}
					return;
				}

				if (e.key === "Escape" && onCancel) {
					e.preventDefault();
					onCancel();
					return;
				}
			};

			textarea.addEventListener("keydown", handleKeyDown);
			return () => textarea.removeEventListener("keydown", handleKeyDown);
		}, [value, isSubmitting, onSubmit, onCancel]);

		const textareaElement = (
			<textarea
				ref={textareaRef}
				value={value}
				onChange={(e) => {
					const newValue = e.target.value;
					if (newValue.length <= maxLength) {
						onChange(newValue);
					}
				}}
				onInput={adjustTextareaHeight}
				placeholder={placeholder}
				className={cn(
					"w-full p-4 text-sm resize-none",
					"bg-background border-0",
					"focus:outline-none",
					"placeholder:text-muted-foreground/60",
				)}
				style={{ minHeight: "120px" }}
			/>
		);

		const charCount = value.length;
		const isNearLimit = charCount > maxLength * 0.8;
		const isAtLimit = charCount >= maxLength;

		const previewElement = (
			<div
				className="p-4 overflow-auto"
				style={{ minHeight: `${editorHeight}px` }}
			>
				{value.trim() ? (
					<CommentContent content={value} />
				) : (
					<p className="text-muted-foreground/60 text-sm">预览区域</p>
				)}
			</div>
		);

		return (
			<div ref={containerRef} className={cn("space-y-3", className)}>
				{replyTo && (
					<div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
						<span className="text-sm text-muted-foreground">
							回复{" "}
							<span className="font-semibold text-foreground">
								{replyTo.floor} 楼
							</span>
							<span className="text-muted-foreground/60 ml-1">
								@{replyTo.username}
							</span>
						</span>
						{onCancel && (
							<button
								type="button"
								className="text-muted-foreground hover:text-foreground text-sm"
								onClick={onCancel}
							>
								取消
							</button>
						)}
					</div>
				)}

				{/* Mobile: Tab layout */}
				<div className="md:hidden">
					<Tabs defaultValue="edit" className="w-full">
						<TabsList className="w-full">
							<TabsTrigger value="edit" className="flex-1">
								编辑
							</TabsTrigger>
							<TabsTrigger value="preview" className="flex-1">
								预览
							</TabsTrigger>
						</TabsList>
						<TabsContent value="edit" className="mt-2">
							<div className="rounded-xl border border-input overflow-hidden">
								<MarkdownToolbar
									textareaRef={textareaRef}
									content={value}
									onContentChange={onChange}
									className="rounded-t-xl rounded-b-none"
								/>
								{textareaElement}
							</div>
						</TabsContent>
						<TabsContent value="preview" className="mt-2">
							<div className="rounded-xl border border-input bg-muted/20">
								{previewElement}
							</div>
						</TabsContent>
					</Tabs>
				</div>

				{/* Desktop: Split layout */}
				<div className="hidden md:grid md:grid-cols-2 gap-4">
					<div className="rounded-xl border border-input overflow-hidden">
						<MarkdownToolbar
							textareaRef={textareaRef}
							content={value}
							onContentChange={onChange}
							className="rounded-t-xl rounded-b-none"
						/>
						{textareaElement}
					</div>
					<div className="rounded-xl border border-input bg-muted/20 overflow-hidden">
						{previewElement}
					</div>
				</div>

				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="text-xs text-muted-foreground hidden sm:block">
							支持 Markdown · LaTeX · 代码高亮
						</span>
						<span
							className={cn(
								"text-xs transition-colors",
								isAtLimit
									? "text-destructive font-medium"
									: isNearLimit
										? "text-amber-500"
										: "text-muted-foreground",
							)}
						>
							{charCount}/{maxLength}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground hidden sm:block">
							<kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">
								Ctrl+Enter
							</kbd>{" "}
							发送
						</span>
						{onCancel && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={onCancel}
								disabled={isSubmitting}
							>
								取消
							</Button>
						)}
						<Button
							type="button"
							size="sm"
							onClick={onSubmit}
							disabled={!value.trim() || isSubmitting}
						>
							{isSubmitting ? "发送中..." : "发送评论"}
						</Button>
					</div>
				</div>
			</div>
		);
	},
);

CommentEditor.displayName = "CommentEditor";

export default CommentEditor;
