import { Skeleton } from "@/components/ui/skeleton";

interface CommentSkeletonProps {
	count?: number;
}

export default function CommentSkeleton({ count = 3 }: CommentSkeletonProps) {
	return (
		<div className="space-y-4">
			{Array.from({ length: count }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are static and never reorder
				<div key={i} className="flex gap-3">
					<div className="flex flex-col items-center gap-1 shrink-0">
						<Skeleton className="h-8 w-8 rounded-full" />
						<Skeleton className="h-3 w-6" />
					</div>
					<div className="flex-1 space-y-2 pb-4 border-b border-border/50 last:border-0 last:pb-0">
						<div className="flex items-center gap-2">
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-3 w-16" />
						</div>
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
						<div className="flex gap-3 mt-2">
							<Skeleton className="h-5 w-12" />
							<Skeleton className="h-5 w-8" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
