import { Hash } from "lucide-react";
import { ThemeToggle } from "@/components/common";
import { BreadcrumbWithItems } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useBreadcrumb } from "@/hooks/useBreadcrumb";
import { SearchBar } from "./SearchBar";

export function TopBar() {
	const breadcrumbItems = useBreadcrumb();

	return (
		<header className="sticky top-0 z-10 h-14 shrink-0 border-b bg-white dark:bg-gray-950 dark:border-gray-800 sa-pt">
			<div className="h-full px-3 sm:px-6 grid items-center grid-cols-[1fr_auto_1fr] gap-2">
				<div className="flex items-center gap-2 min-w-0 justify-self-start">
					<div className="sm:hidden flex items-center gap-1.5">
						<Hash className="h-5 w-5 shrink-0 text-amber-600" />
						<span className="text-sm font-semibold">Synapse</span>
					</div>
					<SidebarTrigger className="-ml-1 hidden md:inline-flex" />
					<div className="hidden sm:block">
						<BreadcrumbWithItems items={breadcrumbItems} />
					</div>
				</div>

				<div className="min-w-0 justify-self-center w-full max-w-[640px]">
					<SearchBar />
				</div>

				<div className="hidden sm:block justify-self-end">
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
