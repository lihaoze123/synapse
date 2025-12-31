import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface TagProps {
	name: string;
	clickable?: boolean;
	size?: "sm" | "md";
	className?: string;
}

export default function Tag({
	name,
	clickable = true,
	size = "sm",
	className,
}: TagProps) {
	const baseClasses = cn(
		"inline-flex items-center rounded font-medium transition-colors",
		size === "sm" && "px-1.5 py-0.5 text-xs",
		size === "md" && "px-2 py-0.5 text-sm",
		clickable
			? "bg-secondary/50 text-secondary-foreground hover:bg-secondary cursor-pointer"
			: "bg-muted/50 text-muted-foreground",
		className,
	);

	if (clickable) {
		return (
			<Link to="/" search={{ tag: name }} className={baseClasses}>
				#{name}
			</Link>
		);
	}

	return <span className={baseClasses}>#{name}</span>;
}
