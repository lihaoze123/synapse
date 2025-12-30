import { Link } from "@tanstack/react-router";
import { Hash, LogIn, LogOut, MessageCircle, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Menu,
	MenuItem,
	MenuPopup,
	MenuSeparator,
	MenuTrigger,
} from "@/components/ui/menu";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
	const { user, logout } = useAuth();
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const isDarkMode = document.documentElement.classList.contains("dark");
		setIsDark(isDarkMode);
	}, []);

	const toggleTheme = () => {
		const newIsDark = !isDark;
		setIsDark(newIsDark);
		document.documentElement.classList.toggle("dark", newIsDark);
	};

	return (
		<header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
			<div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8 mx-auto max-w-6xl">
				<div className="flex items-center gap-8">
					<Link to="/" className="flex items-center gap-2.5 group">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
							<Hash className="h-5 w-5" />
						</div>
						<span className="text-lg font-semibold tracking-tight">Synapse</span>
					</Link>

					<nav className="hidden md:flex items-center gap-1">
						<Link to="/">
							{({ isActive }) => (
								<Button
									variant={isActive ? "secondary" : "ghost"}
									size="sm"
									className="font-medium"
								>
									<MessageCircle className="mr-1.5 h-4 w-4" />
									动态
								</Button>
							)}
						</Link>
					</nav>
				</div>

				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleTheme}
						className="h-9 w-9"
					>
						{isDark ? (
							<Sun className="h-4 w-4" />
						) : (
							<Moon className="h-4 w-4" />
						)}
					</Button>

					{user ? (
						<Menu>
							<MenuTrigger
								render={
									<button
										type="button"
										className="flex items-center gap-2 rounded-full p-1.5 hover:bg-secondary transition-colors duration-150"
									>
										<Avatar className="h-8 w-8 ring-2 ring-border/50">
											<AvatarImage
												src={user.avatarUrl || undefined}
												alt={user.username}
											/>
											<AvatarFallback className="text-xs font-medium">
												{user.username.slice(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
									</button>
								}
							/>
							<MenuPopup className="min-w-[180px]">
								<div className="px-3 py-2.5 text-sm">
									<p className="font-semibold">{user.username}</p>
								</div>
								<MenuSeparator />
								<MenuItem
									className="text-destructive focus:text-destructive"
									onSelect={logout}
								>
									<LogOut className="mr-2 h-4 w-4" />
									退出登录
								</MenuItem>
							</MenuPopup>
						</Menu>
					) : (
						<Link to="/login">
							<Button size="sm" className="font-medium shadow-sm">
								<LogIn className="mr-1.5 h-4 w-4" />
								登录
							</Button>
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
