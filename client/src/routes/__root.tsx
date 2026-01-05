import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { AnimatePresence } from "@/components/ui/animations";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks";
import { useNotificationRealtime } from "@/hooks/useNotificationRealtime";
import Devtools from "@/integrations/devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

interface MyRouterContext {
	queryClient: QueryClient;
}

function RealtimeBridge() {
	// Keep WS alive across pages; tie to auth so it reconnects after login/logout.
	// We don't use the value directly; we just want re-renders on auth changes.
	const { isAuthenticated } = useAuth();
	void isAuthenticated;
	// Mount notification realtime listener
	useNotificationRealtime();
	return null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<ErrorBoundary>
			<SidebarProvider>
				<AnimatePresence mode="wait">
					<Outlet />
				</AnimatePresence>
				<RealtimeBridge />
				<Toaster />
				<Suspense>
					<Devtools plugins={[TanStackQueryDevtools]} />
				</Suspense>
			</SidebarProvider>
		</ErrorBoundary>
	),
});
