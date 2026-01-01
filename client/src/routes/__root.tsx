import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import Devtools from "@/integrations/devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<SidebarProvider>
			<Outlet />
			<Toaster />
			<Suspense>
				<Devtools plugins={[TanStackQueryDevtools]} />
			</Suspense>
		</SidebarProvider>
	),
});
