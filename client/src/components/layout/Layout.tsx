import type { ReactNode } from "react";
import LeftSidebar from "./LeftSidebar";
import { TopBar } from "./TopBar";

interface LayoutProps {
	children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<LeftSidebar />
			<TopBar />
			<main className="ml-[280px] mt-14 p-6 lg:p-8">{children}</main>
		</div>
	);
}
