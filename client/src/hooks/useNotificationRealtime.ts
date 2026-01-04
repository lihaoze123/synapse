import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { notificationsKeys } from "@/query-keys";

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
	const url = wsUrl ? `${wsUrl}?token=${encodeURIComponent(token)}` : null;

	const { lastJsonMessage } = useWebSocket(url, {
		reconnectAttempts: 10,
		reconnectInterval: 1000,
		maxReconnectInterval: 15000,
		shouldReconnect: () => {
			return true;
		},
	});

	useEffect(() => {
		if (!lastJsonMessage || typeof lastJsonMessage !== "object") return;

		if (lastJsonMessage.type === "unreadCount") {
			const count = Number((lastJsonMessage as { count: unknown }).count);
			if (!Number.isNaN(count)) {
				queryClient.setQueryData(notificationsKeys.unreadCount, count);
			}
		} else if (lastJsonMessage.type === "notification") {
			queryClient.invalidateQueries({
				queryKey: ["notifications", "list"],
			});
		}
	}, [lastJsonMessage, queryClient]);
}
