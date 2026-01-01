import type { ReactNode } from "react";
import { lazy, Suspense } from "react";
import { SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

const BottomNav = lazy(() =>
	import("./BottomNav").then((m) => ({ default: m.BottomNav })),
);

interface LayoutProps {
	children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	const isMobile = useIsMobile();

	return (
		<>
			{isMobile ? (
				<div className="min-h-screen w-full flex flex-col">
					<a
						href="#main-content"
						className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:rounded focus:shadow-lg focus:outline-none"
					>
						跳转到主要内容
					</a>

					<TopBar />

					{/* biome-ignore lint/correctness/useUniqueElementIds: stable ID needed for skip link accessibility */}
					<main
						id="main-content"
						tabIndex={-1}
						className="p-4 sm:p-6 lg:p-8"
						style={{
							paddingBottom: "calc(env(safe-area-inset-bottom) + 3.5rem)",
						}} /* only BottomNav height */
					>
						{children}
					</main>

					<Suspense fallback={null}>
						<BottomNav />
					</Suspense>
				</div>
			) : (
				<div className="flex min-h-screen w-full">
					<AppSidebar />
					<SidebarInset>
						<a
							href="#main-content"
							className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:rounded focus:shadow-lg focus:outline-none"
						>
							跳转到主要内容
						</a>
						<TopBar />
						{/* biome-ignore lint/correctness/useUniqueElementIds: stable ID needed for skip link accessibility */}
						<main id="main-content" tabIndex={-1} className="p-6 lg:p-8">
							{children}
						</main>
					</SidebarInset>
				</div>
			)}
		</>
	);
}
