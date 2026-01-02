import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrivateOverlayProps {
	className?: string;
}

export default function PrivateOverlay({ className }: PrivateOverlayProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center py-8 text-muted-foreground",
				className,
			)}
		>
			<div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-3">
				<Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
			</div>
			<p className="text-sm font-medium">私密内容</p>
			<p className="text-xs mt-1">需要密码查看</p>
		</div>
	);
}
