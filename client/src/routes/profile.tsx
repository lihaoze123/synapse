import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { useMemo } from "react";
import { Feed } from "@/components/feed";
import { Layout } from "@/components/layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth, useUserPosts } from "@/hooks";
import { authService } from "@/services/auth";

export const Route = createFileRoute("/profile")({
	beforeLoad: () => {
		if (!authService.isAuthenticated()) {
			throw redirect({ to: "/login" });
		}
	},
	component: ProfilePage,
});

function ProfilePage() {
	const { user } = useAuth();
	const navigate = useNavigate();

	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useUserPosts(user?.id ?? 0);

	const posts = useMemo(() => {
		return data?.pages.flatMap((page) => page.content) ?? [];
	}, [data]);

	if (!user) {
		return null;
	}

	return (
		<Layout>
			<div className="space-y-6">
				<div className="flex flex-col items-center gap-4 py-8 bg-card rounded-xl border shadow-sm">
					<Avatar className="h-24 w-24 ring-4 ring-border/30">
						<AvatarImage
							src={user.avatarUrl || undefined}
							alt={user.username}
						/>
						<AvatarFallback className="text-2xl font-medium">
							{user.username.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>

					<div className="text-center">
						<h1 className="text-xl font-semibold">{user.username}</h1>
						<p className="text-sm text-muted-foreground mt-1">
							{posts.length > 0
								? `${data?.pages[0]?.totalElements ?? 0} 篇内容`
								: "暂无内容"}
						</p>
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() => navigate({ to: "/settings" })}
					>
						<Settings className="mr-1.5 h-4 w-4" />
						编辑资料
					</Button>
				</div>

				<div>
					<h2 className="text-lg font-semibold mb-4">我的内容</h2>
					<Feed
						posts={posts}
						isLoading={isLoading}
						isFetchingNextPage={isFetchingNextPage}
						hasNextPage={hasNextPage}
						fetchNextPage={fetchNextPage}
						emptyMessage="你还没有发布任何内容"
					/>
				</div>
			</div>
		</Layout>
	);
}
