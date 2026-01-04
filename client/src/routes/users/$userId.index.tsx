import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { useMemo } from "react";
import FollowButton from "@/components/common/FollowButton";
import FollowStats from "@/components/common/FollowStats";
import { Feed } from "@/components/feed";
import { Layout } from "@/components/layout";
import { AnimatedPage } from "@/components/ui/animations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth, useUserPosts } from "@/hooks";
import { userService } from "@/services/users";

export const Route = createFileRoute("/users/$userId/")({
	component: UserProfilePage,
	staticData: {
		breadcrumb: {
			label: (match: { params: { userId: string } }) => {
				const params = match.params;
				return `用户 #${params.userId}`;
			},
		},
	},
});

function UserProfilePage() {
	const { userId } = Route.useParams();
	const userIdNum = Number.parseInt(userId, 10);
	const isValidId = !Number.isNaN(userIdNum) && userIdNum > 0;
	const { user: currentUser } = useAuth();
	const navigate = useNavigate();

	const isMe = currentUser?.id === userIdNum;

	const { data: targetUser, isLoading: isLoadingUser } = useQuery({
		queryKey: ["user", userIdNum],
		queryFn: () => userService.getUser(userIdNum),
		enabled: isValidId,
	});

	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useUserPosts(isValidId ? userIdNum : 0);

	const posts = useMemo(() => {
		return data?.pages.flatMap((page) => page.content) ?? [];
	}, [data]);

	if (!isValidId) {
		return (
			<Layout>
				<AnimatedPage transition="scale">
					<div className="max-w-2xl mx-auto">
						<Card className="p-8 text-center">
							<p className="text-muted-foreground">无效的用户 ID</p>
						</Card>
					</div>
				</AnimatedPage>
			</Layout>
		);
	}

	if (isLoadingUser) {
		return (
			<Layout>
				<AnimatedPage transition="scale">
					<div className="max-w-2xl mx-auto">
						<Card className="p-8 text-center">
							<p className="text-muted-foreground">加载中...</p>
						</Card>
					</div>
				</AnimatedPage>
			</Layout>
		);
	}

	if (!targetUser) {
		return (
			<Layout>
				<AnimatedPage transition="scale">
					<div className="max-w-2xl mx-auto">
						<Card className="p-8 text-center">
							<p className="text-muted-foreground">用户不存在</p>
						</Card>
					</div>
				</AnimatedPage>
			</Layout>
		);
	}

	return (
		<Layout>
			<AnimatedPage transition="scale">
				<div className="max-w-2xl mx-auto">
					<div className="space-y-6">
						<Card className="p-6">
							<div className="flex flex-col items-center gap-4">
								<Avatar className="h-24 w-24 ring-4 ring-border/30">
									<AvatarImage
										src={targetUser.avatarUrl || undefined}
										alt={targetUser.displayName || targetUser.username}
									/>
									<AvatarFallback className="text-2xl font-medium">
										{(targetUser.displayName || targetUser.username)
											.slice(0, 2)
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>

								<div className="text-center">
									<h1 className="text-xl font-semibold">
										{targetUser.displayName || targetUser.username}
									</h1>
									<p className="text-sm text-muted-foreground mt-0.5">
										@{targetUser.username}
									</p>
									{targetUser.bio && (
										<p className="text-sm mt-2 max-w-md">{targetUser.bio}</p>
									)}
									<p className="text-sm text-muted-foreground mt-2">
										{posts.length > 0
											? `${data?.pages[0]?.totalElements ?? 0} 篇内容`
											: "暂无内容"}
									</p>
								</div>

								<FollowStats userId={userIdNum} />

								{isMe ? (
									<Button
										variant="outline"
										size="sm"
										onClick={() => navigate({ to: "/settings" })}
									>
										<Settings className="mr-1.5 h-4 w-4" />
										编辑资料
									</Button>
								) : (
									<FollowButton userId={userIdNum} />
								)}
							</div>
						</Card>

						<div>
							<h2 className="text-lg font-semibold mb-4">
								{isMe
									? "我的内容"
									: `${targetUser.displayName || targetUser.username} 的内容`}
							</h2>
							<Feed
								posts={posts}
								isLoading={isLoading}
								isFetchingNextPage={isFetchingNextPage}
								hasNextPage={hasNextPage}
								fetchNextPage={fetchNextPage}
								emptyMessage={
									isMe ? "你还没有发布任何内容" : "该用户还没有发布任何内容"
								}
							/>
						</div>
					</div>
				</div>
			</AnimatedPage>
		</Layout>
	);
}
