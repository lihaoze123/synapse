import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "./button";
import { Card } from "./card";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "default" | "destructive";
	onConfirm: () => void;
	isConfirming?: boolean;
}

export function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "确认",
	cancelLabel = "取消",
	variant = "default",
	onConfirm,
	isConfirming = false,
}: ConfirmDialogProps) {
	const handleConfirm = () => {
		onConfirm();
	};

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity" />
				<DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 transition-all">
					<Card className="p-5 shadow-md">
						<DialogPrimitive.Title className="text-base font-medium mb-1.5">
							{title}
						</DialogPrimitive.Title>
						<DialogPrimitive.Description className="text-sm text-muted-foreground mb-5">
							{description}
						</DialogPrimitive.Description>
						<div className="flex items-center justify-end gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={isConfirming}
								onClick={() => onOpenChange(false)}
							>
								{cancelLabel}
							</Button>
							<Button
								variant={variant === "destructive" ? "destructive" : "default"}
								size="sm"
								onClick={handleConfirm}
								disabled={isConfirming}
							>
								{isConfirming ? "处理中..." : confirmLabel}
							</Button>
						</div>
					</Card>
				</DialogPrimitive.Popup>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
