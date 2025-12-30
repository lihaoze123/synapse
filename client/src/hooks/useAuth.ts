import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { authService } from "../services/auth";
import type { User } from "../types";

export function useAuth() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const user = authService.getUser() as User | null;
	const isAuthenticated = authService.isAuthenticated();

	const loginMutation = useMutation({
		mutationFn: authService.login,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user"] });
			navigate({ to: "/" });
		},
	});

	const registerMutation = useMutation({
		mutationFn: authService.register,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user"] });
			navigate({ to: "/" });
		},
	});

	const logout = useCallback(() => {
		authService.logout();
		queryClient.invalidateQueries({ queryKey: ["user"] });
		navigate({ to: "/login" });
	}, [queryClient, navigate]);

	return {
		user,
		isAuthenticated,
		login: loginMutation.mutateAsync,
		register: registerMutation.mutateAsync,
		logout,
		isLoggingIn: loginMutation.isPending,
		isRegistering: registerMutation.isPending,
		loginError: loginMutation.error,
		registerError: registerMutation.error,
	};
}
