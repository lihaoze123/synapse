import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
	label: string;
	href?: string;
	icon?: LucideIcon;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
	className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
	return (
		<nav
			className={cn("flex items-center gap-1.5 text-sm", className)}
			aria-label="面包屑导航"
		>
			{items.map((item, index) => (
				<div key={item.label} className="flex items-center gap-1.5">
					{index > 0 && (
						<ChevronRight
							className="h-4 w-4 text-gray-400"
							aria-hidden="true"
						/>
					)}
					{item.href ? (
						<a
							href={item.href}
							className="text-gray-500 hover:text-gray-900 transition-colors"
						>
							{item.icon && (
								<item.icon className="h-4 w-4 inline mr-1" aria-hidden="true" />
							)}
							{item.label}
						</a>
					) : (
						<span className="text-gray-900 font-medium">
							{item.icon && (
								<item.icon className="h-4 w-4 inline mr-1" aria-hidden="true" />
							)}
							{item.label}
						</span>
					)}
				</div>
			))}
		</nav>
	);
}
