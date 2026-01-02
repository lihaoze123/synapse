import { Link } from "@tanstack/react-router";
import { Bell, Bookmark, Home, Search, User } from "lucide-react";
import { useAuth } from "@/hooks";
import { useUnreadCount } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function BottomNav() {
	const { user } = useAuth();
	const { data: unreadCount = 0 } = useUnreadCount({
		refetchInterval: user ? 30000 : undefined,
	});

	const items = [
		{ to: "/", label: "首页", icon: Home },
		{ to: "/search", label: "搜索", icon: Search },
		...(user
			? [
					{
						to: "/notifications",
						label: "通知",
						icon: Bell,
						badge: unreadCount,
					},
					{ to: "/bookmarks", label: "收藏", icon: Bookmark },
				]
			: []),
		{
			to: user ? "/profile" : "/login",
			label: user ? "我的" : "登录",
			icon: User,
		},
	];

	return (
		<nav className="fixed bottom-0 inset-x-0 z-20 border-t bg-white dark:bg-gray-950 dark:border-gray-800 md:hidden sa-pb">
			<ul className="flex items-stretch justify-around h-14">
				{items.map((it) => {
					const Icon = it.icon;
					const badge = "badge" in it ? (it.badge ?? 0) : 0;
					return (
						<li key={it.to} className="flex-1">
							<Link
								to={
									it.to as
										| "/"
										| "/search"
										| "/notifications"
										| "/bookmarks"
										| "/profile"
										| "/login"
								}
								className="flex h-full w-full flex-col items-center justify-center text-xs text-gray-600 dark:text-gray-300"
								activeProps={{
									className: "text-amber-600 dark:text-amber-400",
								}}
								aria-label={it.label}
							>
								{({ isActive }) => (
									<>
										<div className="relative">
											<Icon
												className={cn(
													"h-6 w-6 mb-0.5",
													isActive && "scale-110",
												)}
											/>
											{badge > 0 && (
												<span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
													{badge > 99 ? "99+" : badge}
												</span>
											)}
										</div>
										<span className="leading-none">{it.label}</span>
									</>
								)}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
