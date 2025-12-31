import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
	icon: LucideIcon;
	label: string;
	active?: boolean;
	to?: string;
}

export default function NavItem({
	icon: Icon,
	label,
	active,
	to,
}: NavItemProps) {
	return (
		<Link to={to || "#"} aria-label={label} className="block">
			{({ isActive }) => (
				<div
					className={cn(
						"flex items-center gap-2 px-3 h-9 rounded text-sm font-medium",
						"sidebar-item-hover",
						(isActive || active) && "sidebar-item-active",
					)}
					aria-current={isActive || active ? "page" : undefined}
				>
					<Icon className="h-4 w-4" aria-hidden="true" />
					<span>{label}</span>
				</div>
			)}
		</Link>
	);
}
