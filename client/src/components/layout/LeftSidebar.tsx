import {
	Code,
	FileText,
	Hash,
	MessageCircle,
	Plus,
	Search,
	Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostType } from "@/types";
import NavItem from "./NavItem";

const contentTypes: {
	type: PostType;
	label: string;
	icon: typeof Code;
	color: string;
}[] = [
	{
		type: "SNIPPET",
		label: "代码片段",
		icon: Code,
		color: "text-blue-600 dark:text-blue-400",
	},
	{
		type: "ARTICLE",
		label: "文章",
		icon: FileText,
		color: "text-green-600 dark:text-green-400",
	},
	{
		type: "MOMENT",
		label: "动态",
		icon: MessageCircle,
		color: "text-amber-600 dark:text-amber-400",
	},
];

const placeholderTopics = [
	{ id: 1, name: "JavaScript", icon: "📜" },
	{ id: 2, name: "Python", icon: "🐍" },
	{ id: 3, name: "React", icon: "⚛️" },
	{ id: 4, name: "Spring Boot", icon: "☕" },
	{ id: 5, name: "算法", icon: "🧮" },
];

export default function LeftSidebar() {
	return (
		<div className="fixed left-0 top-0 h-screen w-[280px] bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-20 flex flex-col">
			<div className="h-14 flex items-center gap-2 px-4 border-b border-gray-200 dark:border-gray-800">
				<div className="h-8 w-8 rounded-md bg-amber-500 flex items-center justify-center">
					<Hash className="h-5 w-5 text-white" />
				</div>
				<span className="text-base font-semibold">Synapse</span>
			</div>

			<nav className="px-2 py-3 space-y-1">
				<NavItem icon={MessageCircle} label="动态" active to="/" />
				<NavItem icon={Search} label="搜索" to="/search" />
				<NavItem icon={Plus} label="发布" to="/publish" />
			</nav>

			<section className="px-2 py-3 border-t border-gray-200 dark:border-gray-800">
				<h3 className="px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
					内容类型
				</h3>
				<div className="space-y-1">
					{contentTypes.map(({ type, label, icon: Icon, color }) => (
						<a
							key={type}
							href={`/?type=${type}`}
							className={cn(
								"flex items-center gap-2 px-3 h-9 rounded text-sm font-medium",
								"sidebar-item-hover",
							)}
						>
							<Icon className={cn("h-4 w-4", color)} />
							<span>{label}</span>
						</a>
					))}
				</div>
			</section>

			<section className="px-2 py-3 border-t border-gray-200 dark:border-gray-800 flex-1 overflow-y-auto">
				<h3 className="px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
					热门话题
				</h3>
				<div className="space-y-1">
					{placeholderTopics.map((topic) => (
						<a
							key={topic.id}
							href={`/?tag=${topic.name}`}
							className={cn(
								"flex items-center gap-2 px-3 h-9 rounded text-sm font-medium",
								"sidebar-item-hover",
							)}
						>
							<span className="text-sm">{topic.icon}</span>
							<span>{topic.name}</span>
						</a>
					))}
				</div>
			</section>

			<div className="px-2 py-3 border-t border-gray-200 dark:border-gray-800">
				<a
					href="/settings"
					className={cn(
						"flex items-center gap-2 px-3 h-9 rounded text-sm font-medium",
						"sidebar-item-hover",
					)}
				>
					<Settings className="h-4 w-4" />
					<span>设置</span>
				</a>
			</div>
		</div>
	);
}
