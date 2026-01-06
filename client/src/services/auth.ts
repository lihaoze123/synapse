import type { ApiResponse, AuthResponse } from "../types";
import api from "./api";

interface LoginRequest {
	username: string;
	password: string;
}

interface RegisterRequest {
	username: string;
	email: string;
	password: string;
	avatarUrl?: string;
}

export const authService = {
	async login(data: LoginRequest): Promise<AuthResponse> {
		const response = await api.post<ApiResponse<AuthResponse>>(
			"/auth/login",
			data,
		);
		if (response.data.success && response.data.data) {
			const { token, user } = response.data.data;
			localStorage.setItem("token", token);
			localStorage.setItem("user", JSON.stringify(user));
			return response.data.data;
		}
		throw new Error(response.data.message || "Login failed");
	},

	async register(data: RegisterRequest): Promise<AuthResponse> {
		const response = await api.post<ApiResponse<AuthResponse>>(
			"/auth/register",
			data,
		);
		if (response.data.success && response.data.data) {
			const { token, user } = response.data.data;
			localStorage.setItem("token", token);
			localStorage.setItem("user", JSON.stringify(user));
			return response.data.data;
		}
		throw new Error(response.data.message || "Registration failed");
	},

	logout(): void {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	},

	async fetchCurrentUser() {
		const response =
			await api.get<ApiResponse<AuthResponse["user"]>>("/auth/me");
		if (response.data.success && response.data.data) {
			const user = response.data.data;
			localStorage.setItem("user", JSON.stringify(user));
			return user;
		}
		throw new Error(response.data.message || "Failed to fetch user");
	},

	getToken(): string | null {
		return localStorage.getItem("token");
	},

	getUser() {
		const userStr = localStorage.getItem("user");
		if (userStr) {
			return JSON.parse(userStr);
		}
		return null;
	},

	isAuthenticated(): boolean {
		return !!this.getToken();
	},

	getOAuthAuthorizationUrl(provider: "github" | "google"): string {
		return `/oauth2/authorization/${provider}`;
	},

	saveOAuthState(state: string): void {
		localStorage.setItem("oauth_state", state);
	},

	consumeOAuthState(): string | null {
		const state = localStorage.getItem("oauth_state");
		localStorage.removeItem("oauth_state");
		return state;
	},

	generateOAuthState(): string {
		return (
			Math.random().toString(36).substring(2, 15) +
			Math.random().toString(36).substring(2, 15)
		);
	},
};
