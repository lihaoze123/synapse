import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "../../types";
import FollowButton from "./FollowButton";

interface UserListItemProps {
	user: User;
	showFollowButton?: boolean;
	className?: string;
}

export default function UserListItem({
	user,
	showFollowButton = true,
	className,
}: UserListItemProps) {
	return (
		<div
			className={cn(
				"flex items-center justify-between py-3 px-4 hover:bg-accent/50 transition-colors",
				className,
			)}
		>
			<Link
				to="/users/$userId"
				params={{ userId: String(user.id) }}
				className="flex items-center gap-3 flex-1 min-w-0"
			>
				<Avatar className="h-10 w-10 ring-2 ring-border/30">
					<AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
					<AvatarFallback className="text-sm font-medium">
						{user.username.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<span className="font-semibold truncate">{user.username}</span>
			</Link>
			{showFollowButton && <FollowButton userId={user.id} size="sm" />}
		</div>
	);
}
