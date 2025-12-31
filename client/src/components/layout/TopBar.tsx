import { SidebarTrigger } from "@/components/ui/sidebar";
import { BreadcrumbWithItems } from "@/components/ui/breadcrumb";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import { SearchBar } from "./SearchBar";

// TODO: Implement theme toggle functionality
function ThemeToggle() {
	return <div className="h-8 w-8" />;
}

export function TopBar() {
	const breadcrumbItems = useBreadcrumb();

	return (
		<header className="sticky top-0 z-10 h-14 shrink-0 border-b bg-white dark:bg-gray-950 dark:border-gray-800">
			<div className="h-full px-6 flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<SidebarTrigger className="-ml-1" />
					<BreadcrumbWithItems items={breadcrumbItems} />
				</div>

				<SearchBar />

				<ThemeToggle />
			</div>
		</header>
	);
}
