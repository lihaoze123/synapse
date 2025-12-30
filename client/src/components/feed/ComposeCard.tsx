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
		color: "text-amber-600",
		hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-950/30",
	},
	{
		type: "SNIPPET" as PostType,
		icon: Code,
		label: "代码",
		color: "text-blue-600",
		hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
	},
	{
		type: "ARTICLE" as PostType,
		icon: FileText,
		label: "文章",
		color: "text-green-600",
		hoverBg: "hover:bg-green-50 dark:hover:bg-green-950/30",
	},
];

export default function ComposeCard({ onCompose }: ComposeCardProps) {
	const { user } = useAuth();

	if (!user) {
		return null;
	}

	return (
		<Card className="p-5">
			<div className="flex items-center gap-4">
				<Avatar className="h-11 w-11 ring-2 ring-border/30">
					<AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
					<AvatarFallback className="text-sm font-medium">
						{user.username.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				<button
					type="button"
					onClick={() => onCompose("MOMENT")}
					className={cn(
						"flex-1 rounded-xl bg-secondary/60 px-4 py-3",
						"text-left text-sm text-muted-foreground",
						"transition-all duration-150",
						"hover:bg-secondary hover:text-foreground",
						"focus:outline-none focus:ring-2 focus:ring-primary/20",
					)}
				>
					分享点什么...
				</button>
			</div>

			<div className="mt-4 flex items-center justify-end gap-1 border-t border-border/50 pt-4">
				{composeButtons.map(({ type, icon: Icon, label, color, hoverBg }) => (
					<button
						key={type}
						type="button"
						onClick={() => onCompose(type)}
						className={cn(
							"flex items-center gap-1.5 rounded-lg px-3.5 py-2",
							"text-sm font-medium transition-all duration-150",
							color,
							hoverBg,
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
