import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SearchBar } from "./SearchBar";

// TODO: Implement theme toggle functionality
function ThemeToggle() {
	return <div className="h-8 w-8" />;
}

// TODO: Implement user dropdown menu with profile, settings, logout
function UserDropdown() {
	return <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />;
}

export function TopBar() {
	// TODO: Integrate with TanStack Router to generate breadcrumb dynamically based on current route
	// Current route patterns: /, /search, /publish, /posts/:id
	const breadcrumbItems: BreadcrumbItem[] = [
		{ id: "feed", label: "动态" },
		{ id: "all", label: "全部" },
	];

	return (
		<header className="fixed top-0 left-[280px] right-0 h-14 bg-white border-b border-gray-200 dark:bg-gray-950 dark:border-gray-800 z-10">
			<div className="h-full px-6 flex items-center justify-between">
				<Breadcrumb items={breadcrumbItems} />

				<SearchBar />

				<div className="flex items-center gap-3">
					<ThemeToggle />
					<UserDropdown />
				</div>
			</div>
		</header>
	);
}
