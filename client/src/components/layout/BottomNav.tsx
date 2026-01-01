import { Link } from "@tanstack/react-router";
import { Bookmark, Home, Search, User } from "lucide-react";
import { useAuth } from "@/hooks";
import { cn } from "@/lib/utils";

export function BottomNav() {
	const { user } = useAuth();

	const items = [
		{ to: "/", label: "首页", icon: Home },
		{ to: "/search", label: "搜索", icon: Search },
		...(user ? [{ to: "/bookmarks", label: "收藏", icon: Bookmark }] : []),
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
					return (
						<li key={it.to} className="flex-1">
							<Link
								to={
									it.to as
										| "/"
										| "/search"
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
										<Icon
											className={cn("h-6 w-6 mb-0.5", isActive && "scale-110")}
										/>
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
