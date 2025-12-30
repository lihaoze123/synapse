import { cn } from "@/lib/utils";

interface ArticleContentProps {
	title: string;
	summary?: string | null;
	coverImage?: string | null;
}

export default function ArticleContent({
	title,
	summary,
	coverImage,
}: ArticleContentProps) {
	return (
		<div className="space-y-2">
			<h3 className="text-lg font-semibold leading-tight line-clamp-2">
				{title}
			</h3>

			<div className={cn("flex gap-4", coverImage && "items-start")}>
				<div className="flex-1 min-w-0">
					{summary && (
						<p className="text-sm text-muted-foreground line-clamp-3">
							{summary}
						</p>
					)}
				</div>

				{coverImage && (
					<div className="shrink-0">
						<img
							src={coverImage}
							alt={title}
							className="h-20 w-28 rounded-lg object-cover"
						/>
					</div>
				)}
			</div>
		</div>
	);
}
