import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

type AuthErrorHandler = () => void;

// Global callback for handling auth errors (401)
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
			// Clear auth data
			localStorage.removeItem("token");
			localStorage.removeItem("user");

			// Call registered handler or fallback to window.location
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
