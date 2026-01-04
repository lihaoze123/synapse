// Centralized React Query keys to avoid duplication across hooks
export const notificationsKeys = {
	unreadCount: ["notifications", "unread-count"] as const,
	list: (params: unknown = {}) => ["notifications", "list", params] as const,
};
