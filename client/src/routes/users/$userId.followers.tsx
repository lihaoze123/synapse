import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import UserListItem from "@/components/common/UserListItem";
import { Card } from "@/components/ui/card";
import { useFollowers } from "@/hooks";
import { userService } from "@/services/users";

export const Route = createFileRoute("/users/$userId/followers")({
	component: FollowersPage,
});

function FollowersPage() {
	const { userId } = Route.useParams();
	const userIdNum = Number.parseInt(userId, 10);
	const isValidId = !Number.isNaN(userIdNum) && userIdNum > 0;

	const { data: targetUser } = useQuery({
		queryKey: ["user", userIdNum],
		queryFn: () => userService.getUser(userIdNum),
		enabled: isValidId,
	});

	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useFollowers(isValidId ? userIdNum : 0);

	const followers = useMemo(() => {
		return data?.pages.flatMap((page) => page.content) ?? [];
	}, [data]);

	if (!isValidId) {
		return (
			<div className="min-h-screen bg-background">
				<div className="max-w-2xl mx-auto px-4 py-8">
					<Card className="p-8 text-center">
						<p className="text-muted-foreground">无效的用户 ID</p>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="max-w-2xl mx-auto px-4 py-8">
				<div className="flex items-center gap-4 mb-6">
					<Link
						to="/users/$userId"
						params={{ userId }}
						className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</Link>
					<div>
						<h1 className="text-xl font-semibold">
							{targetUser?.username ?? "用户"}的粉丝
						</h1>
					</div>
				</div>

				<Card className="overflow-hidden">
					{isLoading ? (
						<div className="p-8 text-center text-muted-foreground">
							加载中...
						</div>
					) : followers.length === 0 ? (
						<div className="p-8 text-center text-muted-foreground">
							暂无粉丝
						</div>
					) : (
						<div className="divide-y">
							{followers.map((follow) => (
								<UserListItem key={follow.id} user={follow.follower} />
							))}
						</div>
					)}

					{hasNextPage && (
						<div className="p-4 border-t">
							<button
								type="button"
								onClick={() => fetchNextPage()}
								disabled={isFetchingNextPage}
								className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								{isFetchingNextPage ? "加载中..." : "加载更多"}
							</button>
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
