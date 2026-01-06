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

	const setOAuthStateCookie = useCallback((state: string) => {
		// Prefer Cookie Store API if available to avoid direct document.cookie assignment.
		type CookieStoreType = {
			set: (init: {
				name: string;
				value: string;
				expires: number;
				path?: string;
			}) => Promise<void>;
		};
		const nav = navigator as unknown as { cookieStore?: CookieStoreType };
		if (nav.cookieStore && typeof nav.cookieStore.set === "function") {
			// fire-and-forget
			void nav.cookieStore.set({
				name: "oauth_state",
				value: state,
				expires: Date.now() + 300 * 1000,
				path: "/",
			});
		} else {
			// Fall back to document.cookie for broad compatibility.
			// biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API
			document.cookie = `oauth_state=${state}; path=/; max-age=300; samesite=Lax`;
		}
	}, []);

	const loginWithGitHub = useCallback(() => {
		const state = authService.generateOAuthState();
		authService.saveOAuthState(state);
		// Also persist state in a short-lived cookie so backend can validate it
		setOAuthStateCookie(state);
		window.location.href = authService.getOAuthAuthorizationUrl(
			"github",
			state,
		);
	}, [setOAuthStateCookie]);

	const loginWithGoogle = useCallback(() => {
		const state = authService.generateOAuthState();
		authService.saveOAuthState(state);
		setOAuthStateCookie(state);
		window.location.href = authService.getOAuthAuthorizationUrl(
			"google",
			state,
		);
	}, [setOAuthStateCookie]);

	return {
		user,
		isAuthenticated,
		isValidating,
		login: loginMutation.mutateAsync,
		register: registerMutation.mutateAsync,
		logout,
		loginWithGitHub,
		loginWithGoogle,
		isLoggingIn: loginMutation.isPending,
		isRegistering: registerMutation.isPending,
		loginError: loginMutation.error,
		registerError: registerMutation.error,
	};
}
