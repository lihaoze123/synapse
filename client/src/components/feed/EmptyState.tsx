import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
	title?: string;
	description?: string;
	className?: string;
}

export default function EmptyState({
	title = "暂无内容",
	description = "成为第一个分享的人吧！",
	className,
}: EmptyStateProps) {
	return (
		<Card className={cn("py-12 text-center", className)}>
			<div className="flex flex-col items-center gap-3">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<Inbox className="h-6 w-6 text-muted-foreground" />
				</div>
				<div className="space-y-1">
					<h3 className="font-medium">{title}</h3>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
			</div>
		</Card>
	);
}
