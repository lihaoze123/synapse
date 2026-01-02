import { createFileRoute, redirect } from "@tanstack/react-router";
import { userService } from "@/services/users";

export const Route = createFileRoute("/u/$username")({
	loader: async ({ params }) => {
		const user = await userService.getUserByUsername(params.username);
		throw redirect({
			to: "/users/$userId",
			params: { userId: String(user.id) },
		});
	},
});
