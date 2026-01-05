import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Layout } from "@/components/layout";
import { NotificationList } from "@/components/notifications";
import { AnimatedPage } from "@/components/ui/animations";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks";
import { useMarkAllAsRead, useUnreadCount } from "@/hooks/useNotifications";

export const Route = createFileRoute("/notifications")({
	component: NotificationsPage,
	staticData: {
		breadcrumb: {
			label: "通知",
		},
	},
});

function NotificationsPage() {
	const { user } = useAuth();
	const { data: unreadCount = 0 } = useUnreadCount();
	const markAllAsRead = useMarkAllAsRead();

	if (!user) {
		return (
			<Layout>
				<div className="max-w-3xl mx-auto">
					<div className="rounded-lg border p-8 text-center">
						<p className="text-lg font-semibold mb-2">请登录查看通知</p>
						<p className="text-muted-foreground mb-4">
							登录后即可查看和管理你的通知。
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
			<AnimatedPage transition="slideUp">
				<div className="max-w-4xl mx-auto space-y-6">
					<div className="overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50/70 via-background to-background px-4 py-5 shadow-sm dark:from-amber-200/5">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700 shadow-inner dark:bg-amber-200/15 dark:text-amber-200">
									<Bell className="h-5 w-5" />
								</div>
								<div className="space-y-1">
									<h1 className="text-xl font-bold leading-tight">通知</h1>
									<p className="text-sm text-muted-foreground">
										{unreadCount > 0
											? `${unreadCount} 条未读通知`
											: "你已查看所有通知"}
									</p>
								</div>
							</div>
							{unreadCount > 0 && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => markAllAsRead.mutate()}
									disabled={markAllAsRead.isPending}
								>
									全部已读
								</Button>
							)}
						</div>
					</div>

					<div className="rounded-xl border overflow-hidden bg-background shadow-sm">
						<NotificationList />
					</div>
				</div>
			</AnimatedPage>
		</Layout>
	);
}
