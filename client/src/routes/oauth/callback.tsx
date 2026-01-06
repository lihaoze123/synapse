import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/oauth/callback")({
	component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");
		const state = params.get("state");
		const error = params.get("error");

		if (error) {
			setStatus("error");
			setErrorMessage(decodeURIComponent(error));
			return;
		}

		// Validate state to mitigate CSRF
		const expectedState = localStorage.getItem("oauth_state");
		if (!state || !expectedState || state !== expectedState) {
			setStatus("error");
			setErrorMessage("Invalid or missing OAuth state");
			return;
		}
		// State is single-use
		localStorage.removeItem("oauth_state");

		(async () => {
			try {
				if (code) {
					// Legacy path: exchange server-issued code for token + user
					const res = await fetch("/api/auth/oauth2/exchange", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ code }),
					});
					if (!res.ok) throw new Error("Code exchange failed");
					const payload = await res.json();
					if (!payload?.success || !payload?.data) {
						throw new Error(payload?.message || "Code exchange failed");
					}
					const { token, user } = payload.data;
					localStorage.setItem("token", token);
					localStorage.setItem("user", JSON.stringify(user));
				} else {
					// Cookie-based path: JWT delivered via HttpOnly cookie; just fetch current user
					const res = await fetch("/api/auth/me", {
						credentials: "same-origin",
					});
					if (!res.ok) throw new Error("Failed to finalize login");
					const payload = await res.json();
					if (!payload?.success || !payload?.data) {
						throw new Error(payload?.message || "Failed to finalize login");
					}
					localStorage.setItem("user", JSON.stringify(payload.data));
				}
				setStatus("success");
				queryClient.invalidateQueries({ queryKey: ["auth"] });
				queryClient.invalidateQueries({ queryKey: ["user"] });
				setTimeout(() => {
					navigate({ to: "/", replace: true });
				}, 800);
			} catch (e: unknown) {
				const message =
					e && typeof e === "object" && "message" in e
						? String((e as { message?: unknown }).message)
						: "Authentication failed";
				setStatus("error");
				setErrorMessage(message);
			}
		})();
	}, [navigate, queryClient]);

	const statusConfig = {
		loading: {
			icon: <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />,
			title: "Signing you in...",
			subtitle: "Please wait while we complete authentication",
		},
		success: {
			icon: <CheckCircle className="w-12 h-12 text-green-500" />,
			title: "Welcome!",
			subtitle: "Redirecting you to the dashboard...",
		},
		error: {
			icon: <XCircle className="w-12 h-12 text-red-500" />,
			title: "Authentication failed",
			subtitle: errorMessage || "Something went wrong",
		},
	};

	const config = statusConfig[status];

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4">
			{/* Content Card */}
			<div className="w-full max-w-sm">
				<div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl text-center">
					{/* Icon */}
					<div className="mb-6 flex justify-center">{config.icon}</div>

					{/* Status text */}
					<h1 className="text-xl font-semibold text-gray-900 mb-2">
						{config.title}
					</h1>
					<p className="text-gray-500 text-sm">{config.subtitle}</p>

					{/* Error action */}
					{status === "error" && (
						<button
							type="button"
							onClick={() => navigate({ to: "/login", replace: true })}
							className="mt-6 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded-xl text-gray-700 transition-all duration-200"
						>
							Back to Login
						</button>
					)}

					{/* Progress indicator for loading/success */}
					{status !== "error" && (
						<div className="mt-6 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
							<div
								className={`h-full rounded-full transition-all duration-1000 ${
									status === "loading"
										? "w-1/2 bg-gradient-to-r from-amber-500 to-orange-500 animate-pulse"
										: "w-full bg-gradient-to-r from-green-500 to-emerald-500"
								}`}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
