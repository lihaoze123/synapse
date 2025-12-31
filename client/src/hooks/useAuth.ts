import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { setAuthErrorHandler } from "../services/api";
import { authService } from "../services/auth";
import type { User } from "../types";

export function useAuth() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const { data: validatedUser, isLoading: isValidating } = useQuery({
		queryKey: ["auth", "validate"],
		queryFn: async () => {
			const token = authService.getToken();
			if (!token) {
				return null;
			}
			try {
				return await authService.fetchCurrentUser();
			} catch {
				authService.logout();
				return null;
			}
		},
		staleTime: 5 * 60 * 1000,
		retry: false,
	});

	const user = (validatedUser || authService.getUser()) as User | null;
	const isAuthenticated = !!user;

	useEffect(() => {
		const handleAuthError = () => {
			queryClient.clear();
			navigate({ to: "/login", replace: true });
		};

		setAuthErrorHandler(handleAuthError);

		return () => {
			setAuthErrorHandler(null);
		};
	}, [queryClient, navigate]);

	const loginMutation = useMutation({
		mutationFn: authService.login,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			queryClient.invalidateQueries({ queryKey: ["user"] });
			navigate({ to: "/" });
		},
	});

	const registerMutation = useMutation({
		mutationFn: authService.register,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["auth"] });
			queryClient.invalidateQueries({ queryKey: ["user"] });
			navigate({ to: "/" });
		},
	});

	const logout = useCallback(() => {
		authService.logout();
		queryClient.clear();
		navigate({ to: "/login", replace: true });
	}, [queryClient, navigate]);

	return {
		user,
		isAuthenticated,
		isValidating,
		login: loginMutation.mutateAsync,
		register: registerMutation.mutateAsync,
		logout,
		isLoggingIn: loginMutation.isPending,
		isRegistering: registerMutation.isPending,
		loginError: loginMutation.error,
		registerError: registerMutation.error,
	};
}
