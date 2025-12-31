import { useEffect, useRef } from "react";
import { PostCard, PostCardSkeleton } from "@/components/cards";
import type { Post } from "@/types";
import EmptyState from "./EmptyState";

interface FeedProps {
	posts: Post[];
	isLoading?: boolean;
	isFetchingNextPage?: boolean;
	hasNextPage?: boolean;
	fetchNextPage?: () => void;
	emptyMessage?: string;
}

export default function Feed({
	posts,
	isLoading = false,
	isFetchingNextPage = false,
	hasNextPage = false,
	fetchNextPage,
	emptyMessage,
}: FeedProps) {
	const loadMoreRef = useRef<HTMLDivElement>(null);

	const handleObserverRef = useRef<
		((entries: IntersectionObserverEntry[]) => void) | undefined
	>(undefined);
	handleObserverRef.current = (entries: IntersectionObserverEntry[]) => {
		const [entry] = entries;
		if (
			entry.isIntersecting &&
			hasNextPage &&
			!isFetchingNextPage &&
			fetchNextPage
		) {
			fetchNextPage();
		}
	};

	useEffect(() => {
		const element = loadMoreRef.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			(entries) => handleObserverRef.current?.(entries),
			{ threshold: 0.1 },
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	if (isLoading) {
		return (
			<div className="space-y-5">
				{Array.from({ length: 3 }).map((_, i) => (
					<PostCardSkeleton key={`skeleton-${i}`} />
				))}
			</div>
		);
	}

	if (posts.length === 0) {
		return <EmptyState description={emptyMessage} />;
	}

	return (
		<div className="space-y-5">
			{posts.map((post) => (
				<PostCard key={post.id} post={post} />
			))}

			<div ref={loadMoreRef} className="h-4" />

			{isFetchingNextPage && (
				<div className="flex justify-center py-6">
					<div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
				</div>
			)}
		</div>
	);
}
