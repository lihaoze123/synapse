import { Code, FileText, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import type { PostType } from "@/types";

interface ComposeCardProps {
	onCompose: (type: PostType) => void;
}

const composeButtons = [
	{
		type: "MOMENT" as PostType,
		icon: MessageCircle,
		label: "动态",
		color: "text-amber-600 hover:bg-amber-50",
	},
	{
		type: "SNIPPET" as PostType,
		icon: Code,
		label: "代码",
		color: "text-blue-600 hover:bg-blue-50",
	},
	{
		type: "ARTICLE" as PostType,
		icon: FileText,
		label: "文章",
		color: "text-green-600 hover:bg-green-50",
	},
];

export default function ComposeCard({ onCompose }: ComposeCardProps) {
	const { user } = useAuth();

	if (!user) {
		return null;
	}

	return (
		<Card className="p-4">
			<div className="flex items-center gap-3">
				<Avatar className="h-10 w-10">
					<AvatarImage src={user.avatarUrl || undefined} alt={user.username} />
					<AvatarFallback>
						{user.username.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>

				<button
					type="button"
					onClick={() => onCompose("MOMENT")}
					className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/80"
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
						className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${color}`}
					>
						<Icon className="h-4 w-4" />
						<span>{label}</span>
					</button>
				))}
			</div>
		</Card>
	);
}
