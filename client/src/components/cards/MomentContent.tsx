import { useState } from "react";
import { cn } from "@/lib/utils";
import { resolveStaticUrl } from "@/services/api";
import { ImagePreviewModal } from "../common/ImagePreviewModal";

interface MomentContentProps {
	content: string;
	images?: string[] | null;
}

export default function MomentContent({ content, images }: MomentContentProps) {
	const imageCount = images?.length || 0;
	const [previewIndex, setPreviewIndex] = useState<number | null>(null);

	return (
		<div className="py-1 space-y-3">
			<p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground/90 line-clamp-8">
				{content}
			</p>

			{imageCount > 0 && (
				<div
					className={cn(
						"grid gap-1.5 max-w-[300px]",
						imageCount === 1
							? "grid-cols-1"
							: imageCount === 2
								? "grid-cols-2"
								: "grid-cols-3",
					)}
				>
					{images?.slice(0, 9).map((url, index) => {
						const resolvedUrl = resolveStaticUrl(url);
						return (
							<button
								key={url}
								type="button"
								className="relative overflow-hidden rounded bg-muted aspect-square cursor-pointer p-0 border-0"
								onClick={() => setPreviewIndex(index)}
							>
								<img
									src={resolvedUrl}
									alt={`图片 ${index + 1}`}
									className="absolute inset-0 h-full w-full object-cover"
									loading="lazy"
								/>
							</button>
						);
					})}
				</div>
			)}

			<ImagePreviewModal
				images={images ?? []}
				open={previewIndex !== null}
				initialIndex={previewIndex ?? 0}
				onOpenChange={(open) => setPreviewIndex(open ? 0 : null)}
			/>
		</div>
	);
}
