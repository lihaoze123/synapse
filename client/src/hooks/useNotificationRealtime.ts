import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import useWebSocket, { type Options } from "react-use-websocket";
import { notificationsKeys } from "@/query-keys";

type WebSocketMessage =
	| { type: "unreadCount"; count: number }
	| { type: "notification"; data: unknown }
	| { type: string; data?: unknown };

function buildWebSocketUrl(): string | null {
	const apiBase =
		(import.meta.env.VITE_API_BASE_URL as string | undefined) || "/api";
	try {
		if (apiBase.startsWith("http://") || apiBase.startsWith("https://")) {
			const u = new URL(apiBase);
			u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
			const basePath = u.pathname.replace(/\/$/, "");
			u.pathname = `${basePath}/ws/notifications`;
			return u.toString();
		}
		const scheme = window.location.protocol === "https:" ? "wss" : "ws";
		const base = apiBase.replace(/\/$/, "");
		return `${scheme}://${window.location.host}${base}/ws/notifications`;
	} catch {
		return null;
	}
}

export function useNotificationRealtime() {
	const queryClient = useQueryClient();

	const token = localStorage.getItem("token");
	const wsUrl = token ? buildWebSocketUrl() : null;
	const url =
		wsUrl && token ? `${wsUrl}?token=${encodeURIComponent(token)}` : null;

	const socketOptions: Options = {
		reconnectAttempts: 10,
		reconnectInterval: 1000,
		shouldReconnect: () => true,
	};

	const { lastJsonMessage } = useWebSocket(url, socketOptions);

	useEffect(() => {
		if (!lastJsonMessage || typeof lastJsonMessage !== "object") return;

		const message = lastJsonMessage as WebSocketMessage;

		if (message.type === "unreadCount") {
			const count = Number((message as { count: unknown }).count);
			if (!Number.isNaN(count)) {
				queryClient.setQueryData(notificationsKeys.unreadCount, count);
			}
		} else if (message.type === "notification") {
			queryClient.invalidateQueries({
				queryKey: ["notifications", "list"],
			});
		}
	}, [lastJsonMessage, queryClient]);
}
