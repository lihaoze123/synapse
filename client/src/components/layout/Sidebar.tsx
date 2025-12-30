import { Link } from "@tanstack/react-router";
import { Code, FileText, Hash, MessageCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { usePopularTags } from "@/hooks";
import type { PostType } from "@/types";

const contentTypes: {
	type: PostType;
	label: string;
	icon: typeof Code;
	color: string;
}[] = [
	{ type: "SNIPPET", label: "代码片段", icon: Code, color: "text-blue-600" },
	{
		type: "ARTICLE",
		label: "文章",
		icon: FileText,
		color: "text-green-600",
	},
	{
		type: "MOMENT",
		label: "动态",
		icon: MessageCircle,
		color: "text-amber-600",
	},
];

export default function Sidebar() {
	const { data: tags, isLoading } = usePopularTags(10);

	return (
		<aside className="hidden lg:block w-64 shrink-0">
			<div className="sticky top-[4.5rem] space-y-4">
				<Card className="p-4">
					<div className="flex items-center gap-2 mb-3">
						<TrendingUp className="h-4 w-4 text-primary" />
						<h3 className="font-semibold text-sm">热门话题</h3>
					</div>
					<div className="space-y-1">
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items don't reorder
									key={`tag-skeleton-${i}`}
									className="h-8 bg-secondary/50 rounded-lg animate-pulse"
								/>
							))
						) : tags && tags.length > 0 ? (
							tags.map((tag) => (
								<Link
									key={tag.id}
									to="/"
									search={{ tag: tag.name }}
									className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm hover:bg-secondary transition-colors"
								>
									<span>{tag.icon || "#"}</span>
									<span>{tag.name}</span>
								</Link>
							))
						) : (
							<p className="text-sm text-muted-foreground px-2">暂无热门话题</p>
						)}
					</div>
				</Card>

				<Card className="p-4">
					<div className="flex items-center gap-2 mb-3">
						<Hash className="h-4 w-4 text-primary" />
						<h3 className="font-semibold text-sm">内容类型</h3>
					</div>
					<div className="space-y-1">
						{contentTypes.map(({ type, label, icon: Icon, color }) => (
							<Link
								key={type}
								to="/"
								search={{ type }}
								className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm hover:bg-secondary transition-colors"
							>
								<Icon className={`h-4 w-4 ${color}`} />
								<span>{label}</span>
							</Link>
						))}
					</div>
				</Card>
			</div>
		</aside>
	);
}
