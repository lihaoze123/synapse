import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useMemo } from "react";
import PostCard from "@/components/cards/PostCard";
import PostCardSkeleton from "@/components/cards/PostCardSkeleton";
import { IllustratedEmptyState } from "@/components/common/IllustratedEmptyState";
import { Layout } from "@/components/layout";
import {
	AnimatedPage,
	StaggerContainer,
	StaggerItem,
} from "@/components/ui/animations";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth, useBookmarks } from "@/hooks";

export const Route = createFileRoute("/bookmarks")({
	component: BookmarksPage,
	staticData: {
		breadcrumb: {
			label: "收藏",
		},
	},
});

function BookmarksPage() {
	const { user } = useAuth();
	const {
		data,
		isLoading,
		error,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useBookmarks({ size: 10 });

	const bookmarks = useMemo(
		() => data?.pages.flatMap((page) => page.content) ?? [],
		[data],
	);

	if (!user) {
		return (
			<Layout>
				<div className="max-w-3xl mx-auto">
					<div className="rounded-lg border p-8 text-center">
						<p className="text-lg font-semibold mb-2">请登录查看收藏</p>
						<p className="text-muted-foreground mb-4">
							登录后即可查看和管理你的收藏内容。
						</p>
						<Link
							to="/login"
							className={buttonVariants({ variant: "default" })}
						>
							去登录
						</Link>
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<AnimatedPage transition="fade">
				<div className="max-w-4xl mx-auto space-y-6">
					<div className="overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50/70 via-background to-background px-4 py-5 shadow-sm dark:from-amber-200/5">
						<div className="flex items-center gap-3">
							<div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-inner dark:bg-amber-200/15 dark:text-amber-200">
								<Bookmark className="h-5 w-5" />
							</div>
							<div className="space-y-1">
								<h1 className="text-xl font-bold leading-tight">我的收藏</h1>
								<p className="text-sm text-muted-foreground">
									随时回看喜欢的内容，取消收藏后会即时消失。
								</p>
							</div>
						</div>
					</div>

					{error && (
						<div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-destructive shadow-sm">
							加载失败：{error.message}
						</div>
					)}

					{isLoading && (
						<div className="space-y-3">
							<PostCardSkeleton />
							<PostCardSkeleton />
						</div>
					)}

					{!isLoading && bookmarks.length === 0 && !error && (
						<IllustratedEmptyState
							variant="bookmarks"
							action={
								<Link to="/" className={buttonVariants({ variant: "default" })}>
									去首页发现内容
								</Link>
							}
						/>
					)}

					<StaggerContainer className="space-y-3">
						{bookmarks.map((bookmark) => (
							<StaggerItem key={`${bookmark.id}-${bookmark.post.id}`}>
								<PostCard post={bookmark.post} />
							</StaggerItem>
						))}
					</StaggerContainer>

					{hasNextPage && (
						<div className="flex justify-center">
							<Button
								variant="outline"
								onClick={() => fetchNextPage()}
								disabled={isFetchingNextPage}
							>
								{isFetchingNextPage ? "加载中..." : "加载更多"}
							</Button>
						</div>
					)}
				</div>
			</AnimatedPage>
		</Layout>
	);
}
