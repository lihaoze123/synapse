import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/users/$userId")({
	component: UserLayout,
});

function UserLayout() {
	return <Outlet />;
}
