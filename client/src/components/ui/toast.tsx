import {
	AlertTriangle,
	Bookmark,
	CheckCircle,
	Copy,
	Heart,
	Info,
	Share2,
	UserPlus,
	XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast as sonnerToast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
	description?: string;
	duration?: number;
	icon?: ReactNode;
}

const defaultIcons: Record<ToastType, ReactNode> = {
	success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
	error: <XCircle className="h-5 w-5 text-red-500" />,
	info: <Info className="h-5 w-5 text-blue-500" />,
	warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
};

function createToast(type: ToastType, message: string, options?: ToastOptions) {
	const icon = options?.icon ?? defaultIcons[type];

	return sonnerToast[type](message, {
		description: options?.description,
		duration: options?.duration ?? 3000,
		icon,
	});
}

export const toast = {
	success: (message: string, options?: ToastOptions) =>
		createToast("success", message, options),
	error: (message: string, options?: ToastOptions) =>
		createToast("error", message, options),
	info: (message: string, options?: ToastOptions) =>
		createToast("info", message, options),
	warning: (message: string, options?: ToastOptions) =>
		createToast("warning", message, options),

	liked: () =>
		createToast("success", "已点赞", {
			icon: <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />,
			duration: 2000,
		}),

	unliked: () =>
		createToast("info", "已取消点赞", {
			icon: <Heart className="h-5 w-5 text-gray-400" />,
			duration: 2000,
		}),

	bookmarked: () =>
		createToast("success", "已收藏", {
			icon: <Bookmark className="h-5 w-5 text-amber-500 fill-amber-500" />,
			duration: 2000,
		}),

	unbookmarked: () =>
		createToast("info", "已取消收藏", {
			icon: <Bookmark className="h-5 w-5 text-gray-400" />,
			duration: 2000,
		}),

	followed: (username?: string) =>
		createToast("success", username ? `已关注 ${username}` : "已关注", {
			icon: <UserPlus className="h-5 w-5 text-emerald-500" />,
			duration: 2000,
		}),

	unfollowed: (username?: string) =>
		createToast("info", username ? `已取消关注 ${username}` : "已取消关注", {
			icon: <UserPlus className="h-5 w-5 text-gray-400" />,
			duration: 2000,
		}),

	copied: () =>
		createToast("success", "已复制到剪贴板", {
			icon: <Copy className="h-5 w-5 text-emerald-500" />,
			duration: 2000,
		}),

	shared: () =>
		createToast("success", "分享链接已复制", {
			icon: <Share2 className="h-5 w-5 text-emerald-500" />,
			duration: 2000,
		}),

	authRequired: () =>
		createToast("warning", "请先登录", {
			duration: 3000,
		}),
};
