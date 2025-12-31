import { useNavigate } from "@tanstack/react-router";
import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	MenuPopup,
} from "@/components/ui/menu";
import { useAuth } from "@/hooks/useAuth";
import { SearchBar } from "./SearchBar";

// TODO: Implement theme toggle functionality
function ThemeToggle() {
	return <div className="h-8 w-8" />;
}

function UserDropdown() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	if (!user) {
		return null;
	}

	const handleLogout = () => {
		logout();
		navigate({ to: "/login" });
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className="h-8 w-8 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				aria-label="用户菜单"
			>
				<Avatar className="h-8 w-8">
					<AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
					<AvatarFallback className="text-xs font-medium">
						{user.username.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<MenuPopup align="end" sideOffset={8}>
				<DropdownMenuItem
					onClick={() =>
						navigate({
							to: "/users/$userId",
							params: { userId: String(user.id) },
						})
					}
				>
					<User className="h-4 w-4" />
					<span>个人资料</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
					<Settings className="h-4 w-4" />
					<span>设置</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleLogout} variant="destructive">
					<LogOut className="h-4 w-4" />
					<span>登出</span>
				</DropdownMenuItem>
			</MenuPopup>
		</DropdownMenu>
	);
}

export function TopBar() {
	// TODO: Integrate with TanStack Router to generate breadcrumb dynamically based on current route
	// Current route patterns: /, /search, /publish, /posts/:id
	const breadcrumbItems: BreadcrumbItem[] = [
		{ id: "feed", label: "动态" },
		{ id: "all", label: "全部" },
	];

	return (
		<header className="fixed top-0 left-0 md:left-[280px] right-0 h-14 bg-white border-b border-gray-200 dark:bg-gray-950 dark:border-gray-800 z-10">
			<div className="h-full px-6 flex items-center justify-between">
				<Breadcrumb items={breadcrumbItems} />

				<SearchBar />

				<div className="flex items-center gap-3">
					<ThemeToggle />
					<UserDropdown />
				</div>
			</div>
		</header>
	);
}
