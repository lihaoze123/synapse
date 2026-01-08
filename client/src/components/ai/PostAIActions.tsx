import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Code, FileText, Loader2, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AIAction = "summarize" | "explain";

interface PostAIActionsProps {
	postTitle: string | null;
	postContent: string | null;
	postType: "SNIPPET" | "ARTICLE" | "MOMENT";
	language?: string | null;
	onSummarize: (content: string) => void;
	onExplain?: (code: string, language: string) => void;
	className?: string;
}

interface AIResultModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	action: AIAction;
	postTitle: string | null;
	result: string;
	isLoading: boolean;
	error: string | null;
}

function AIResultModal({
	open,
	onOpenChange,
	action,
	postTitle,
	result,
	isLoading,
	error,
}: AIResultModalProps) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (open && result && !isLoading) {
			setCopied(false);
		}
	}, [open, result, isLoading]);

	const handleCopy = useCallback(() => {
		if (!result) return;
		navigator.clipboard.writeText(result);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [result]);

	const isSummarize = action === "summarize";
	const Icon = isSummarize ? FileText : Code;

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
				<DialogPrimitive.Popup
					className={cn(
						"fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2",
						"rounded-2xl bg-card shadow-2xl border border-border/50",
						"animate-in fade-in zoom-in-95 duration-200",
					)}
				>
					<div className="flex items-center justify-between border-b border-border px-6 py-4">
						<div className="flex items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
								<Icon className="h-5 w-5" />
							</div>
							<div>
								<DialogPrimitive.Title className="text-base font-semibold">
									{isSummarize ? "AI 内容摘要" : "AI 代码解释"}
								</DialogPrimitive.Title>
								{postTitle && (
									<p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
										{postTitle}
									</p>
								)}
							</div>
						</div>
						<DialogPrimitive.Close
							className={cn(
								"rounded-lg p-1.5 -mr-1.5",
								"text-muted-foreground hover:bg-muted hover:text-foreground",
								"transition-colors",
							)}
						>
							<X className="h-5 w-5" />
						</DialogPrimitive.Close>
					</div>

					<div className="px-6 py-5">
						{isLoading ? (
							<div className="flex flex-col items-center justify-center gap-4 py-8">
								<div className="relative">
									<div className="absolute inset-0 animate-pulse rounded-full bg-amber-400/20 blur-xl" />
									<div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
										<Loader2 className="h-6 w-6 animate-spin" />
									</div>
								</div>
								<p className="text-sm text-muted-foreground">
									AI 正在生成中...
								</p>
							</div>
						) : error ? (
							<div className="flex flex-col items-center justify-center gap-4 py-8">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
									<X className="h-6 w-6" />
								</div>
								<p className="text-sm text-muted-foreground">{error}</p>
							</div>
						) : (
							<div className="rounded-lg border border-border/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 px-4 py-4 dark:from-amber-950/20 dark:to-orange-950/20">
								<p className="whitespace-pre-wrap text-sm leading-relaxed">
									{result}
								</p>
							</div>
						)}
					</div>

					{!isLoading && !error && result && (
						<div className="flex items-center justify-end border-t border-border px-6 py-4">
							<Button
								variant="outline"
								size="sm"
								onClick={handleCopy}
								className="gap-2"
							>
								{copied ? (
									<>
										<span className="h-4 w-4">✓</span>
										已复制
									</>
								) : (
									<>
										<Sparkles className="h-4 w-4" />
										复制结果
									</>
								)}
							</Button>
						</div>
					)}
				</DialogPrimitive.Popup>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

export default function PostAIActions({
	postTitle,
	postContent,
	postType,
	language,
	onSummarize,
	onExplain,
	className,
}: PostAIActionsProps) {
	const [activeAction, setActiveAction] = useState<AIAction | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [result, setResult] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSummarize = useCallback(() => {
		if (!postContent) return;
		setActiveAction("summarize");
		setIsModalOpen(true);
		setResult("");
		setError(null);
		setIsLoading(true);
		onSummarize(postContent);
	}, [postContent, onSummarize]);

	const handleExplain = useCallback(() => {
		if (!postContent || !language || !onExplain) return;
		setActiveAction("explain");
		setIsModalOpen(true);
		setResult("");
		setError(null);
		setIsLoading(true);
		onExplain(postContent, language);
	}, [postContent, language, onExplain]);

	const handleSetResult = useCallback((res: string) => {
		setResult(res);
		setIsLoading(false);
	}, []);

	const handleSetError = useCallback((err: string) => {
		setError(err);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		const handler = (e: Event) => {
			const customEvent = e as CustomEvent<{ result?: string; error?: string }>;
			if (customEvent.detail.result) {
				handleSetResult(customEvent.detail.result);
			}
			if (customEvent.detail.error) {
				handleSetError(customEvent.detail.error);
			}
		};

		window.addEventListener("ai-result", handler);
		return () => window.removeEventListener("ai-result", handler);
	}, [handleSetResult, handleSetError]);

	const showExplain = postType === "SNIPPET" && language && onExplain;

	return (
		<>
			<div className={cn("flex items-center gap-2", className)}>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleSummarize}
					className="h-8 gap-1.5 px-2.5 text-xs font-medium text-muted-foreground hover:text-primary"
				>
					<Sparkles className="h-3.5 w-3.5" />
					<span className="hidden sm:inline">AI 摘要</span>
				</Button>

				{showExplain && (
					<>
						<div className="h-4 w-px bg-border" />
						<Button
							variant="ghost"
							size="sm"
							onClick={handleExplain}
							className="h-8 gap-1.5 px-2.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
						>
							<Code className="h-3.5 w-3.5" />
							<span className="hidden sm:inline">AI 解释</span>
						</Button>
					</>
				)}
			</div>

			{activeAction && (
				<AIResultModal
					open={isModalOpen}
					onOpenChange={setIsModalOpen}
					action={activeAction}
					postTitle={postTitle}
					result={result}
					isLoading={isLoading}
					error={error}
				/>
			)}
		</>
	);
}
