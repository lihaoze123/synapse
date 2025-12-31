import { Link } from "@tanstack/react-router";
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
				<Link to="/" className="block" aria-label="动态">
					{({ isActive }) => (
						<div
							className={cn(
								"flex items-center gap-2 px-3 h-9 rounded text-sm font-medium",
								"sidebar-item-hover",
								isActive && "sidebar-item-active",
							)}
							aria-current={isActive ? "page" : undefined}
						>
							<MessageCircle className="h-4 w-4" aria-hidden="true" />
							<span>动态</span>
						</div>
					)}
				</Link>
				<Link to="/search" className="block" aria-label="搜索">
					{({ isActive }) => (
						<div
							className={cn(
								"flex items-center gap-2 px-3 h-9 rounded text-sm font-medium",
								"sidebar-item-hover",
								isActive && "sidebar-item-active",
							)}
							aria-current={isActive ? "page" : undefined}
						>
							<Search className="h-4 w-4" aria-hidden="true" />
							<span>搜索</span>
						</div>
					)}
				</Link>
				<Link to="/publish" className="block" aria-label="发布">
					{({ isActive }) => (
						<div
							className={cn(
								"flex items-center gap-2 px-3 h-9 rounded text-sm font-medium",
								"sidebar-item-hover",
								isActive && "sidebar-item-active",
							)}
							aria-current={isActive ? "page" : undefined}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							<span>发布</span>
						</div>
					)}
				</Link>
			</nav>

			<section className="px-2 py-3 border-t border-gray-200 dark:border-gray-800">
				<h3 className="px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
					内容类型
				</h3>
				<div className="space-y-1">
					{contentTypes.map(({ type, label, icon: Icon, color }) => (
						<Link
							key={type}
							to="/"
							search={{ type }}
							className="block"
							aria-label={label}
						>
							{({ isActive }) => (
								<div
									className={cn(
										"flex items-center gap-2 px-3 h-9 rounded text-sm font-medium",
										"sidebar-item-hover",
										isActive && "sidebar-item-active",
									)}
									aria-current={isActive ? "page" : undefined}
								>
									<Icon className={cn("h-4 w-4", color)} aria-hidden="true" />
									<span>{label}</span>
								</div>
							)}
						</Link>
					))}
				</div>
			</section>

			<section className="px-2 py-3 border-t border-gray-200 dark:border-gray-800 flex-1 overflow-y-auto">
				<h3 className="px-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
					热门话题
				</h3>
				<div className="space-y-1">
					{placeholderTopics.map((topic) => (
						<Link
							key={topic.id}
							to="/"
							search={{ tag: topic.name }}
							className="block"
							aria-label={topic.name}
						>
							{({ isActive }) => (
								<div
									className={cn(
										"flex items-center gap-2 px-3 h-9 rounded text-sm font-medium",
										"sidebar-item-hover",
										isActive && "sidebar-item-active",
									)}
									aria-current={isActive ? "page" : undefined}
								>
									<span className="text-sm" role="img" aria-label={topic.name}>
										{topic.icon}
									</span>
									<span className="truncate">{topic.name}</span>
								</div>
							)}
						</Link>
					))}
				</div>
			</section>

			<div className="px-2 py-3 border-t border-gray-200 dark:border-gray-800">
				<Link to="/settings" className="block" aria-label="设置">
					{({ isActive }) => (
						<div
							className={cn(
								"flex items-center gap-2 px-3 h-9 rounded text-sm font-medium",
								"sidebar-item-hover",
								isActive && "sidebar-item-active",
							)}
							aria-current={isActive ? "page" : undefined}
						>
							<Settings className="h-4 w-4" aria-hidden="true" />
							<span>设置</span>
						</div>
					)}
				</Link>
			</div>
		</div>
	);
}
