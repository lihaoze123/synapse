import { cn } from "@/lib/utils";
import { resolveStaticUrl } from "@/services/api";

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
			<h3 className="text-base font-semibold leading-snug line-clamp-2">
				{title}
			</h3>

			<div className={cn("flex gap-3", coverImage && "items-start")}>
				<div className="flex-1 min-w-0">
					{summary && (
						<p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
							{summary}
						</p>
					)}
				</div>

				{coverImage && (
					<div className="shrink-0">
						<img
							src={resolveStaticUrl(coverImage)}
							alt={title}
							loading="lazy"
							className="h-16 w-24 rounded object-cover border border-border sm:h-20 sm:w-28"
						/>
					</div>
				)}
			</div>
		</div>
	);
}
