import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
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
	const { isAuthenticated } = useAuth();
	void isAuthenticated;
	useNotificationRealtime();
	return null;
}

const AUTH_ROUTES = ["/login", "/register", "/oauth/callback"];

function RootLayout() {
	const routerState = useRouterState();
	const currentPath = routerState.location?.pathname ?? "";
	const isAuthRoute = AUTH_ROUTES.some(
		(route) => currentPath === route || currentPath.startsWith(`${route}/`),
	);

	return (
		<ErrorBoundary>
			{/*
        Keep SidebarProvider mounted for all routes so components using useSidebar
        don't lose context during route transitions (e.g. navigating to /login).
        Previously, auth routes were not wrapped which could throw:
        "useSidebar must be used within a SidebarProvider." until a hard refresh.
      */}
			<SidebarProvider>
				{isAuthRoute ? (
					<>
						<AnimatePresence mode="wait">
							<Outlet />
						</AnimatePresence>
						<Toaster />
					</>
				) : (
					<>
						<AnimatePresence mode="wait">
							<Outlet />
						</AnimatePresence>
						<RealtimeBridge />
						<Toaster />
						<Suspense>
							<Devtools plugins={[TanStackQueryDevtools]} />
						</Suspense>
					</>
				)}
			</SidebarProvider>
		</ErrorBoundary>
	);
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: RootLayout,
});
