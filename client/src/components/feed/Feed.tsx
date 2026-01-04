import { useEffect, useRef } from "react";
import { PostCard, PostCardSkeleton } from "@/components/cards";
import { IllustratedEmptyState } from "@/components/common/IllustratedEmptyState";
import { StaggerContainer, StaggerItem } from "@/components/ui/animations";
import type { Post } from "@/types";

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
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list never reorders
					<PostCardSkeleton key={i} />
				))}
			</div>
		);
	}

	if (posts.length === 0) {
		return <IllustratedEmptyState variant="posts" description={emptyMessage} />;
	}

	return (
		<StaggerContainer className="space-y-5">
			{posts.map((post) => (
				<StaggerItem key={post.id}>
					<PostCard post={post} />
				</StaggerItem>
			))}

			<div ref={loadMoreRef} className="h-4" />

			{isFetchingNextPage && (
				<div className="flex justify-center py-6">
					<div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
				</div>
			)}
		</StaggerContainer>
	);
}
