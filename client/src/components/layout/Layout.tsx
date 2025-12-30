import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface LayoutProps {
	children: ReactNode;
	showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<div className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
				<div className="flex gap-8">
					{showSidebar && <Sidebar />}
					<main className="flex-1 min-w-0 max-w-[680px]">{children}</main>
				</div>
			</div>
		</div>
	);
}
