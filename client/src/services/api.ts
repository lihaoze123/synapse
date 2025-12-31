import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const STATIC_BASE_URL =
	import.meta.env.VITE_STATIC_BASE_URL?.replace(/\/$/, "") || "";

export function resolveStaticUrl(url: string): string {
	if (!url) return url;
	if (url.startsWith("http://") || url.startsWith("https://")) {
		return url;
	}
	return STATIC_BASE_URL ? `${STATIC_BASE_URL}${url}` : url;
}

type AuthErrorHandler = () => void;

let onAuthError: AuthErrorHandler | null = null;

export function setAuthErrorHandler(handler: AuthErrorHandler | null) {
	onAuthError = handler;
}

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("token");
			localStorage.removeItem("user");

			if (onAuthError) {
				onAuthError();
			} else {
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	},
);

export default api;
