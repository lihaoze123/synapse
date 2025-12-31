import { Link } from "@tanstack/react-router";
import {
	Atom,
	Braces,
	Code,
	FileText,
	GitBranch,
	Hash,
	Leaf,
	MessageCircle,
	Search,
	Terminal,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { PostType } from "@/types";
import { UserMenu } from "./UserMenu";

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
	{
		id: 1,
		name: "JavaScript",
		icon: Braces,
		color: "text-yellow-500 dark:text-yellow-400",
	},
	{
		id: 2,
		name: "Python",
		icon: Terminal,
		color: "text-blue-500 dark:text-blue-400",
	},
	{
		id: 3,
		name: "React",
		icon: Atom,
		color: "text-cyan-500 dark:text-cyan-400",
	},
	{
		id: 4,
		name: "Spring Boot",
		icon: Leaf,
		color: "text-green-600 dark:text-green-400",
	},
	{
		id: 5,
		name: "算法",
		icon: GitBranch,
		color: "text-purple-500 dark:text-purple-400",
	},
];

export function AppSidebar() {
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<Link to="/" className="flex items-center gap-2 px-2 py-1.5">
					<Hash className="size-5 shrink-0 text-amber-600" />
					<span className="text-base font-semibold group-data-[collapsible=icon]:hidden">
						Synapse
					</span>
				</Link>
			</SidebarHeader>

			<SidebarContent>
				{/* 导航链接 */}
				<SidebarGroup>
					<SidebarGroupLabel>导航</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<Link to="/" aria-label="动态">
									{({ isActive }) => (
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip="动态"
										>
											<div>
												<MessageCircle />
												<span>动态</span>
											</div>
										</SidebarMenuButton>
									)}
								</Link>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<Link to="/search" search={{ keyword: "" }} aria-label="搜索">
									{({ isActive }) => (
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip="搜索"
										>
											<div>
												<Search />
												<span>搜索</span>
											</div>
										</SidebarMenuButton>
									)}
								</Link>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* 内容类型 */}
				<SidebarGroup>
					<SidebarGroupLabel>内容类型</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{contentTypes.map(({ type, label, icon: Icon, color }) => (
								<SidebarMenuItem key={type}>
									<Link to="/" search={{ type }} aria-label={label}>
										{({ isActive }) => (
											<SidebarMenuButton
												asChild
												isActive={isActive}
												tooltip={label}
											>
												<div>
													<Icon className={cn("h-4 w-4", color)} />
													<span>{label}</span>
												</div>
											</SidebarMenuButton>
										)}
									</Link>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* 热门话题 */}
				<SidebarGroup>
					<SidebarGroupLabel>热门话题</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{placeholderTopics.map((topic) => (
								<SidebarMenuItem key={topic.id}>
									<Link
										to="/"
										search={{ tag: topic.name }}
										aria-label={topic.name}
									>
										{({ isActive }) => (
											<SidebarMenuButton
												asChild
												isActive={isActive}
												tooltip={topic.name}
											>
												<div>
													<topic.icon className={cn("h-4 w-4", topic.color)} />
													<span className="truncate">{topic.name}</span>
												</div>
											</SidebarMenuButton>
										)}
									</Link>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<UserMenu />
			</SidebarFooter>
		</Sidebar>
	);
}
