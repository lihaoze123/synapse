import { Link } from "@tanstack/react-router";
import { Code, FileText, Hash, MessageCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePopularTags } from "@/hooks";
import type { PostType } from "@/types";

const contentTypes: {
	type: PostType;
	label: string;
	icon: typeof Code;
	color: string;
	bgColor: string;
}[] = [
	{ type: "SNIPPET", label: "代码片段", icon: Code, color: "text-blue-600", bgColor: "group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30" },
	{
		type: "ARTICLE",
		label: "文章",
		icon: FileText,
		color: "text-green-600",
		bgColor: "group-hover:bg-green-50 dark:group-hover:bg-green-950/30",
	},
	{
		type: "MOMENT",
		label: "动态",
		icon: MessageCircle,
		color: "text-amber-600",
		bgColor: "group-hover:bg-amber-50 dark:group-hover:bg-amber-950/30",
	},
];

export default function Sidebar() {
	const { data: tags, isLoading } = usePopularTags(10);

	return (
		<aside className="hidden lg:block w-72 shrink-0">
			<div className="sticky top-[4.5rem] space-y-5">
				<Card className="p-5">
					<div className="flex items-center gap-2.5 mb-4">
						<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
							<TrendingUp className="h-4 w-4 text-primary" />
						</div>
						<h3 className="font-semibold text-sm tracking-tight">热门话题</h3>
					</div>
					<div className="space-y-1">
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items don't reorder
									key={`tag-skeleton-${i}`}
									className="h-9 bg-secondary/50 rounded-lg animate-pulse"
								/>
							))
						) : tags && tags.length > 0 ? (
							tags.map((tag) => (
								<Link
									key={tag.id}
									to="/"
									search={{ tag: tag.name }}
									className={cn(
										"group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm",
										"text-muted-foreground hover:text-foreground",
										"hover:bg-secondary/80 transition-all duration-150",
									)}
								>
									<span className="text-base">{tag.icon || "🏷️"}</span>
									<span className="font-medium">{tag.name}</span>
								</Link>
							))
						) : (
							<p className="text-sm text-muted-foreground px-3 py-2">暂无热门话题</p>
						)}
					</div>
				</Card>

				<Card className="p-5">
					<div className="flex items-center gap-2.5 mb-4">
						<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
							<Hash className="h-4 w-4 text-primary" />
						</div>
						<h3 className="font-semibold text-sm tracking-tight">内容类型</h3>
					</div>
					<div className="space-y-1">
						{contentTypes.map(({ type, label, icon: Icon, color, bgColor }) => (
							<Link
								key={type}
								to="/"
								search={{ type }}
								className={cn(
									"group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm",
									"text-muted-foreground hover:text-foreground",
									"transition-all duration-150",
									bgColor,
								)}
							>
								<Icon className={cn("h-4 w-4", color)} />
								<span className="font-medium">{label}</span>
							</Link>
						))}
					</div>
				</Card>
			</div>
		</aside>
	);
}
