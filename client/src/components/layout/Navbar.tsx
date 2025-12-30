import { Link } from "@tanstack/react-router";
import { Hash, LogIn, LogOut, MessageCircle } from "lucide-react";
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

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
			<div className="flex h-14 items-center justify-between px-4 md:px-6">
				<div className="flex items-center gap-6">
					<Link to="/" className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<Hash className="h-5 w-5" />
						</div>
						<span className="text-lg font-semibold">Synapse</span>
					</Link>

					<nav className="hidden md:flex items-center gap-1">
						<Link to="/">
							{({ isActive }) => (
								<Button variant={isActive ? "secondary" : "ghost"} size="sm">
									<MessageCircle className="mr-1.5 h-4 w-4" />
									动态
								</Button>
							)}
						</Link>
					</nav>
				</div>

				<div className="flex items-center gap-2">
					{user ? (
						<Menu>
							<MenuTrigger
								render={
									<button
										type="button"
										className="flex items-center gap-2 rounded-full p-1 hover:bg-secondary transition-colors"
									>
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={user.avatarUrl || undefined}
												alt={user.username}
											/>
											<AvatarFallback>
												{user.username.slice(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
									</button>
								}
							/>
							<MenuPopup className="min-w-[180px]">
								<div className="px-3 py-2 text-sm">
									<p className="font-medium">{user.username}</p>
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
							<Button size="sm">
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
