import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PostCardSkeletonProps {
	className?: string;
}

export default function PostCardSkeleton({ className }: PostCardSkeletonProps) {
	return (
		<Card className={cn("p-4 animate-pulse", className)}>
			{/* Header skeleton */}
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<div className="h-8 w-8 rounded-full bg-muted" />
					<div className="space-y-1">
						<div className="h-4 w-20 rounded bg-muted" />
					</div>
				</div>
				<div className="h-4 w-4 rounded bg-muted" />
			</div>

			{/* Content skeleton */}
			<div className="space-y-2 mb-3">
				<div className="h-4 w-3/4 rounded bg-muted" />
				<div className="h-20 w-full rounded-lg bg-muted" />
			</div>

			{/* Tags skeleton */}
			<div className="flex gap-1.5">
				<div className="h-5 w-12 rounded-lg bg-muted" />
				<div className="h-5 w-16 rounded-lg bg-muted" />
			</div>
		</Card>
	);
}
