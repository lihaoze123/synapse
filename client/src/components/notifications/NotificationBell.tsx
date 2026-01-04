import { useNavigate } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useState } from "react";
import { Menu, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUnreadCount } from "@/hooks/useNotifications";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
	const isMobile = useIsMobile();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);

	// Fallback polling to cover cases where WS is blocked or proxying WS fails in dev
	const { data: unreadCount = 0 } = useUnreadCount({ refetchInterval: 10_000 });

	const bellIcon = (
		<div className="relative">
			<Bell className="h-5 w-5" />
			{unreadCount > 0 && (
				<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
					{unreadCount > 99 ? "99+" : unreadCount}
				</span>
			)}
		</div>
	);

	if (isMobile) {
		return (
			<button
				type="button"
				onClick={() => navigate({ to: "/notifications" })}
				className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
			>
				{bellIcon}
			</button>
		);
	}

	return (
		<Menu open={open} onOpenChange={setOpen}>
			<MenuTrigger className="p-2 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
				{bellIcon}
			</MenuTrigger>
			<MenuPopup className="w-80" align="end">
				<NotificationDropdown onClose={() => setOpen(false)} />
			</MenuPopup>
		</Menu>
	);
}
