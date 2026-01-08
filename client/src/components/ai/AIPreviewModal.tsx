import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Check, Copy, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AIAction = "improve" | "summarize" | "explain";

interface AIPreviewModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	action: AIAction;
	originalContent: string;
	suggestion: string;
	isLoading?: boolean;
	error?: string | null;
	onApply: () => void;
	onRetry?: () => void;
	className?: string;
}

const ACTION_CONFIG: Record<
	AIAction,
	{ title: string; icon: typeof Sparkles; description: string }
> = {
	improve: {
		title: "AI 润色建议",
		icon: Sparkles,
		description: "查看 AI 生成的改进版本",
	},
	summarize: {
		title: "AI 内容摘要",
		icon: Sparkles,
		description: "查看 AI 生成的内容摘要",
	},
	explain: {
		title: "AI 代码解释",
		icon: Sparkles,
		description: "查看 AI 生成的代码解释",
	},
};

export default function AIPreviewModal({
	open,
	onOpenChange,
	action,
	originalContent,
	suggestion,
	isLoading = false,
	error = null,
	onApply,
	onRetry,
	className,
}: AIPreviewModalProps) {
	const config = ACTION_CONFIG[action];
	const Icon = config.icon;
	const [copied, setCopied] = useState(false);
	const suggestionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (open && suggestion && !isLoading) {
			setCopied(false);
		}
	}, [open, suggestion, isLoading]);

	const handleCopy = useCallback(() => {
		if (!suggestion) return;
		navigator.clipboard.writeText(suggestion);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [suggestion]);

	const handleApply = useCallback(() => {
		onApply();
		onOpenChange(false);
	}, [onApply, onOpenChange]);

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[starting-style]:animate-out data-[starting-style]:fade-out data-[ending-style]:animate-in data-[ending-style]:fade-in" />
				<DialogPrimitive.Popup
					className={cn(
						"fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2",
						"rounded-2xl bg-card shadow-2xl",
						"border border-border/50",
						"data-[starting-style]:animate-out data-[starting-style]:fade-out data-[starting-style]:zoom-out-95 data-[ending-style]:animate-in data-[ending-style]:fade-in data-[ending-style]:zoom-in-95",
						className,
					)}
				>
					<div className="flex items-center justify-between border-b border-border px-6 py-4">
						<div className="flex items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20">
								<Icon className="h-5 w-5" />
							</div>
							<div>
								<DialogPrimitive.Title className="text-base font-semibold">
									{config.title}
								</DialogPrimitive.Title>
								<p className="text-xs text-muted-foreground">
									{config.description}
								</p>
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

					<div className="px-6 py-4">
						{isLoading ? (
							<div className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-8">
								<div className="relative">
									<div className="absolute inset-0 animate-pulse rounded-full bg-amber-400/20 blur-xl" />
									<div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
										<Loader2 className="h-6 w-6 animate-spin" />
									</div>
								</div>
								<div className="text-center">
									<p className="text-sm font-medium text-foreground">
										AI 正在思考中...
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										这可能需要几秒钟
									</p>
								</div>
							</div>
						) : error ? (
							<div className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-8">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
									<X className="h-6 w-6" />
								</div>
								<div className="text-center">
									<p className="text-sm font-medium text-foreground">
										生成失败
									</p>
									<p className="mt-1 text-xs text-muted-foreground">{error}</p>
								</div>
								{onRetry && (
									<Button
										variant="outline"
										size="sm"
										onClick={onRetry}
										className="gap-2"
									>
										<RotateCcw className="h-4 w-4" />
										重试
									</Button>
								)}
							</div>
						) : (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										原始内容
									</span>
								</div>
								<div className="max-h-24 overflow-y-auto rounded-lg border border-border bg-muted/30 px-4 py-3">
									<p className="whitespace-pre-wrap text-sm text-muted-foreground">
										{originalContent}
									</p>
								</div>

								<div className="flex items-center justify-between">
									<span className="text-xs font-medium text-foreground uppercase tracking-wider">
										AI 建议
									</span>
									{!isLoading && !error && suggestion && (
										<Button
											variant="ghost"
											size="sm"
											onClick={handleCopy}
											className="h-7 gap-1.5 px-2 text-xs"
										>
											{copied ? (
												<>
													<Check className="h-3.5 w-3.5" />
													已复制
												</>
											) : (
												<>
													<Copy className="h-3.5 w-3.5" />
													复制
												</>
											)}
										</Button>
									)}
								</div>
								<div
									ref={suggestionRef}
									className="max-h-[300px] overflow-y-auto rounded-lg border border-border/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 px-4 py-3 dark:from-amber-950/20 dark:to-orange-950/20"
								>
									<p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
										{suggestion}
									</p>
								</div>
							</div>
						)}
					</div>

					{!isLoading && !error && suggestion && (
						<div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
							<Button
								variant="outline"
								onClick={() => onOpenChange(false)}
								className="min-w-[80px]"
							>
								取消
							</Button>
							<Button onClick={handleApply} className="min-w-[80px] gap-2">
								<Check className="h-4 w-4" />
								应用
							</Button>
						</div>
					)}
				</DialogPrimitive.Popup>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
