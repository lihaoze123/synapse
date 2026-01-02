import { Popover } from "@base-ui/react/popover";
import { Smile } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
	onSelect: (emoji: string) => void;
	className?: string;
}

const QUICK_EMOJIS = ["😀", "😂", "❤️", "👍", "🔥", "✨", "🎉", "🚀"];

const EMOJI_CATEGORIES = [
	{
		name: "常用",
		emojis: [
			"😀",
			"😂",
			"🥰",
			"😎",
			"🤔",
			"😅",
			"👍",
			"❤️",
			"🔥",
			"✨",
			"🎉",
			"🚀",
			"💯",
			"✅",
			"⭐",
			"💪",
		],
	},
	{
		name: "表情",
		emojis: [
			"😃",
			"😄",
			"😁",
			"😊",
			"😇",
			"🙂",
			"😉",
			"😌",
			"😍",
			"😘",
			"😋",
			"😛",
			"😜",
			"🤪",
			"🤗",
			"🤭",
			"🤫",
			"🤐",
			"🤨",
			"😏",
			"😒",
			"🙄",
			"😬",
			"🥲",
		],
	},
	{
		name: "手势",
		emojis: [
			"👎",
			"👊",
			"✊",
			"🤛",
			"🤜",
			"🤞",
			"✌️",
			"🤟",
			"🤘",
			"👌",
			"👏",
			"🙌",
			"🙏",
		],
	},
	{
		name: "符号",
		emojis: [
			"🧡",
			"💛",
			"💚",
			"💙",
			"💜",
			"💔",
			"💕",
			"💖",
			"💥",
			"💫",
			"🎊",
			"❌",
			"⚡",
		],
	},
];

export default function EmojiPicker({ onSelect, className }: EmojiPickerProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleSelect = (emoji: string) => {
		onSelect(emoji);
		setIsOpen(false);
	};

	return (
		<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger
				className={cn(
					"flex h-9 w-9 items-center justify-center rounded-lg",
					"text-muted-foreground",
					"hover:bg-muted hover:text-foreground",
					"active:scale-95",
					"transition-all duration-150",
					className,
				)}
				title="表情"
			>
				<Smile className="h-5 w-5" />
			</Popover.Trigger>

			<Popover.Portal>
				<Popover.Positioner sideOffset={8} side="top" align="start">
					<Popover.Popup
						className={cn(
							"w-72 rounded-xl border border-border bg-card p-3 shadow-xl",
							"outline-none",
							"data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
							"data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
							"transition-all duration-150",
						)}
					>
						{/* Quick access */}
						<div className="flex items-center gap-1 pb-2 mb-2 border-b border-border">
							{QUICK_EMOJIS.map((emoji) => (
								<button
									key={emoji}
									type="button"
									onClick={() => handleSelect(emoji)}
									className={cn(
										"flex h-8 w-8 items-center justify-center rounded-md text-lg",
										"hover:bg-muted active:scale-95",
										"transition-all duration-100",
									)}
								>
									{emoji}
								</button>
							))}
						</div>

						{/* Categories */}
						<div className="max-h-48 overflow-y-auto space-y-3 pr-1">
							{EMOJI_CATEGORIES.map((category) => (
								<div key={category.name}>
									<div className="text-[11px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
										{category.name}
									</div>
									<div className="grid grid-cols-8 gap-0.5">
										{category.emojis.map((emoji) => (
											<button
												key={emoji}
												type="button"
												onClick={() => handleSelect(emoji)}
												className={cn(
													"flex h-7 w-7 items-center justify-center rounded text-base",
													"hover:bg-muted active:scale-95",
													"transition-all duration-100",
												)}
											>
												{emoji}
											</button>
										))}
									</div>
								</div>
							))}
						</div>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}
