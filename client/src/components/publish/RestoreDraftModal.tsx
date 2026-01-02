import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	type DraftData,
	formatDraftAge,
	getPostTypeLabel,
} from "@/utils/draftStorage";

interface RestoreDraftModalProps {
	open: boolean;
	draft: DraftData | null;
	onRestore: () => void;
	onDiscard: () => void;
}

export default function RestoreDraftModal({
	open,
	draft,
	onRestore,
	onDiscard,
}: RestoreDraftModalProps) {
	if (!draft) return null;

	const typeLabel = getPostTypeLabel(draft.type);
	const timeAgo = formatDraftAge(draft.timestamp);

	return (
		<DialogPrimitive.Root open={open} onOpenChange={() => {}}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Backdrop className="fixed inset-0 z-[60] bg-black/50 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity" />
				<DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-[60] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6 shadow-xl data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 transition-all">
					<div className="flex items-start gap-3">
						<div className="shrink-0 mt-0.5">
							<AlertCircle className="h-5 w-5 text-amber-500" />
						</div>
						<div className="flex-1">
							<DialogPrimitive.Title className="text-lg font-semibold mb-2">
								发现未保存的草稿
							</DialogPrimitive.Title>
							<p className="text-sm text-muted-foreground mb-4">
								检测到{" "}
								<span className="font-medium text-foreground">{typeLabel}</span>{" "}
								类型的未保存草稿
								<br />
								保存于:{" "}
								<span className="font-medium text-foreground">{timeAgo}</span>
							</p>
							<div className="flex items-center justify-end gap-2">
								<Button variant="outline" onClick={onDiscard}>
									丢弃草稿
								</Button>
								<Button onClick={onRestore}>恢复草稿</Button>
							</div>
						</div>
					</div>
				</DialogPrimitive.Popup>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
