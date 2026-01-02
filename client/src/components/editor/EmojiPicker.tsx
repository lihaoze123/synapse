import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Smile } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
	onSelect: (emoji: string) => void;
	className?: string;
}

export default function EmojiPicker({ onSelect, className }: EmojiPickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
	const btnRef = useRef<HTMLButtonElement>(null);
	// Fallback dimensions used for simple positioning and viewport clamping.
	// The actual picker size is dynamic, but these are good approximations.
	const PICKER_WIDTH = 320;
	const PICKER_HEIGHT = 380;

	const handleSelect = (emojiData: { native: string }) => {
		onSelect(emojiData.native);
		setIsOpen(false);
	};

	const updateRect = useCallback(() => {
		const el = btnRef.current;
		if (!el) return;
		setAnchorRect(el.getBoundingClientRect());
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		updateRect();
		const onScrollOrResize = () => updateRect();
		window.addEventListener("resize", onScrollOrResize, { passive: true });
		window.addEventListener("scroll", onScrollOrResize, { passive: true });
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsOpen(false);
		};
		document.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("resize", onScrollOrResize);
			window.removeEventListener("scroll", onScrollOrResize);
			document.removeEventListener("keydown", onKey);
		};
	}, [isOpen, updateRect]);

	// Compute a fixed position in the viewport to avoid clipping by overflow hidden parents.
	const position = useMemo(() => {
		if (!anchorRect) return { left: 0, top: 0 };
		const gap = 8;
		let left = anchorRect.left;
		let top = anchorRect.top - PICKER_HEIGHT - gap; // prefer above
		// If not enough space above, place below.
		if (top < 0) top = anchorRect.bottom + gap;
		// Clamp within viewport horizontally.
		const maxLeft = Math.max(0, window.innerWidth - PICKER_WIDTH - 8);
		if (left > maxLeft) left = maxLeft;
		if (left < 8) left = 8;
		// If still overflowing bottom when placed below, move above.
		if (top + PICKER_HEIGHT > window.innerHeight) {
			const tryAbove = anchorRect.top - PICKER_HEIGHT - gap;
			if (tryAbove >= 0) top = tryAbove;
		}
		return { left, top };
	}, [anchorRect]);

	return (
		<div className="relative">
			<button
				ref={btnRef}
				type="button"
				className={cn(
					"flex h-9 w-9 items-center justify-center rounded-lg",
					"text-muted-foreground",
					"hover:bg-muted hover:text-foreground",
					"active:scale-95",
					"transition-all duration-150",
					className,
				)}
				onClick={() => setIsOpen(!isOpen)}
				title="表情"
			>
				<Smile className="h-5 w-5" />
			</button>

			{isOpen &&
				createPortal(
					<>
						{/* biome-ignore lint/a11y/noStaticElementInteractions: Overlay for closing dropdown */}
						<div
							className="fixed inset-0"
							style={{ zIndex: 1000 }}
							onClick={() => setIsOpen(false)}
							onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
						/>
						<div
							className="fixed"
							style={{
								left: position.left,
								top: position.top,
								zIndex: 1001,
							}}
						>
							<Picker
								data={data}
								onEmojiSelect={handleSelect}
								set="native"
								locale="zh"
								previewPosition="none"
								skinTonePosition="search"
								navPosition="bottom"
								perLine={8}
							/>
						</div>
					</>,
					document.body,
				)}
		</div>
	);
}
