import type { ReactNode } from "react";
import LeftSidebar from "./LeftSidebar";
import { TopBar } from "./TopBar";

interface LayoutProps {
	children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:rounded focus:shadow-lg focus:outline-none"
			>
				跳转到主要内容
			</a>

			<LeftSidebar />
			<TopBar />

			{/* biome-ignore lint/correctness/useUniqueElementIds: stable ID needed for skip link accessibility */}
			<main
				id="main-content"
				tabIndex={-1}
				className="ml-0 md:ml-[280px] mt-14 p-4 sm:p-6 lg:p-8"
			>
				{children}
			</main>
		</div>
	);
}
