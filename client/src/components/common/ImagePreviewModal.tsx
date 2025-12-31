import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { resolveStaticUrl } from "@/services/api";

interface ImagePreviewModalProps {
	images: string[];
	open: boolean;
	initialIndex?: number;
	onOpenChange: (open: boolean) => void;
}

export function ImagePreviewModal({
	images,
	open,
	initialIndex = 0,
	onOpenChange,
}: ImagePreviewModalProps) {
	const [index, setIndex] = useState(initialIndex);

	useEffect(() => {
		setIndex(initialIndex);
	}, [initialIndex]);

	if (!images.length) return null;

	const normalizedIndex =
		((index % images.length) + images.length) % images.length;
	const currentSrc = resolveStaticUrl(images[normalizedIndex]);

	const showPrev = () => setIndex((prev) => prev - 1);
	const showNext = () => setIndex((prev) => prev + 1);

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/80 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity" />
				<DialogPrimitive.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 transition-all">
					<div className="relative flex w-full max-w-5xl items-center justify-center max-h-[90vh]">
						<img
							src={currentSrc}
							alt="预览图片"
							className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
						/>

						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/75"
							aria-label="关闭预览"
						>
							<X className="h-5 w-5" />
						</button>

						{images.length > 1 && (
							<>
								<button
									type="button"
									onClick={showPrev}
									className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/75"
									aria-label="上一张"
								>
									<ChevronLeft className="h-6 w-6" />
								</button>
								<button
									type="button"
									onClick={showNext}
									className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/75"
									aria-label="下一张"
								>
									<ChevronRight className="h-6 w-6" />
								</button>
							</>
						)}

						{images.length > 1 && (
							<div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
								{normalizedIndex + 1} / {images.length}
							</div>
						)}
					</div>
				</DialogPrimitive.Popup>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
