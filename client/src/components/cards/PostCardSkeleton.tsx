import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PostCardSkeletonProps {
	className?: string;
}

export default function PostCardSkeleton({ className }: PostCardSkeletonProps) {
	return (
		<Card className={cn("p-5", className)}>
			{/* Header skeleton */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2.5">
					<div className="h-9 w-9 rounded-full bg-secondary/80 animate-pulse" />
					<div className="space-y-1.5">
						<div className="h-3.5 w-24 rounded bg-secondary/80 animate-pulse" />
						<div className="h-3 w-16 rounded bg-secondary/60 animate-pulse" />
					</div>
				</div>
				<div className="h-6 w-16 rounded-md bg-secondary/60 animate-pulse" />
			</div>

			{/* Content skeleton */}
			<div className="space-y-3 mb-4">
				<div className="h-4 w-4/5 rounded bg-secondary/80 animate-pulse" />
				<div className="h-24 w-full rounded-lg bg-secondary/60 animate-pulse" />
			</div>

			{/* Tags skeleton */}
			<div className="flex gap-2">
				<div className="h-6 w-14 rounded-md bg-secondary/60 animate-pulse" />
				<div className="h-6 w-18 rounded-md bg-secondary/60 animate-pulse" />
				<div className="h-6 w-12 rounded-md bg-secondary/60 animate-pulse" />
			</div>
		</Card>
	);
}
