import { Code, FileText, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { PostType } from "@/types";

interface ComposeCardProps {
	onCompose: (type: PostType) => void;
}

const composeButtons = [
	{
		type: "MOMENT" as PostType,
		icon: MessageCircle,
		label: "动态",
		color: "text-amber-600 dark:text-amber-400",
	},
	{
		type: "SNIPPET" as PostType,
		icon: Code,
		label: "代码",
		color: "text-blue-600 dark:text-blue-400",
	},
	{
		type: "ARTICLE" as PostType,
		icon: FileText,
		label: "文章",
		color: "text-green-600 dark:text-green-400",
	},
];

export default function ComposeCard({ onCompose }: ComposeCardProps) {
	const { user } = useAuth();

	if (!user) {
		return null;
	}

	return (
		<Card className="border-gray-200 rounded p-4">
			<div className="flex items-center gap-3">
				<Avatar className="h-9 w-9">
					<AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
					<AvatarFallback className="text-xs font-medium">
						{user.username.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				<button
					type="button"
					onClick={() => onCompose("MOMENT")}
					className={cn(
						"flex-1 rounded bg-secondary px-3 py-2",
						"text-left text-sm text-muted-foreground",
						"transition-colors duration-150",
						"hover:bg-accent hover:text-foreground",
						"focus:outline-none focus:ring-1 focus:ring-ring",
					)}
				>
					分享点什么...
				</button>
			</div>

			<div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3">
				{composeButtons.map(({ type, icon: Icon, label, color }) => (
					<button
						key={type}
						type="button"
						onClick={() => onCompose(type)}
						className={cn(
							"flex items-center gap-1.5 rounded px-3 py-1.5",
							"text-sm transition-colors duration-150",
							color,
							"hover:bg-accent",
						)}
					>
						<Icon className="h-4 w-4" />
						<span>{label}</span>
					</button>
				))}
			</div>
		</Card>
	);
}
