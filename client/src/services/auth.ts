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

	getOAuthAuthorizationUrl(
		provider: "github" | "google",
		state: string,
	): string {
		// Forward client-generated state to the backend resolver; Spring will include it in the provider request.
		const encoded = encodeURIComponent(state);
		return `/oauth2/authorization/${provider}?state=${encoded}`;
	},

	saveOAuthState(state: string): void {
		localStorage.setItem("oauth_state", state);
	},

	generateOAuthState(): string {
		// Use crypto.getRandomValues() for cryptographically secure random values
		// 32 bytes = 256 bits of entropy, base64url encoded = 43 chars
		const bytes = new Uint8Array(32);
		self.crypto.getRandomValues(bytes);
		return btoa(String.fromCharCode(...bytes))
			.replace(/\+/g, "-")
			.replace(/\//g, "_")
			.replace(/=/g, "");
	},
};
