import { Link, useNavigate } from "@tanstack/react-router";
import {
	ChevronsUpDown,
	LogIn,
	LogOut,
	Settings,
	User,
	UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	MenuPopup,
} from "@/components/ui/menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

export function UserMenu() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	if (!user) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton size="lg" asChild tooltip="登录">
						<Link to="/login">
							<div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-accent">
								<LogIn className="size-4" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">登录 / 注册</span>
								<span className="truncate text-xs text-muted-foreground">
									开始你的旅程
								</span>
							</div>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	const handleLogout = () => {
		logout();
		navigate({ to: "/login" });
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						className="w-full outline-none"
						aria-label="用户菜单"
					>
						<SidebarMenuButton
							size="lg"
							asChild
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							tooltip={user.username}
						>
							<div className="flex size-full items-center gap-2">
								<Avatar className="size-8 rounded-lg">
									<AvatarImage
										src={user.avatarUrl || undefined}
										alt={user.username}
									/>
									<AvatarFallback className="rounded-lg text-xs font-medium">
										{user.username.slice(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">
										{user.username}
									</span>
									<span className="truncate text-xs text-muted-foreground">
										查看个人资料
									</span>
								</div>
								<ChevronsUpDown className="ml-auto size-4" />
							</div>
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<MenuPopup
						side="top"
						align="end"
						sideOffset={8}
						className="w-[--radix-popper-anchor-width] min-w-48"
					>
						<DropdownMenuItem
							onClick={() =>
								navigate({
									to: "/users/$userId",
									params: { userId: String(user.id) },
								})
							}
						>
							<User className="size-4" />
							<span>个人资料</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								navigate({
									to: "/users/$userId/following",
									params: { userId: String(user.id) },
								})
							}
						>
							<UserPlus className="size-4" />
							<span>我的关注</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
							<Settings className="size-4" />
							<span>设置</span>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout}>
							<LogOut className="size-4" />
							<span>登出</span>
						</DropdownMenuItem>
					</MenuPopup>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
