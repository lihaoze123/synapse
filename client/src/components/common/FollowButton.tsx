import { useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "../../hooks/useAuth";
import {
	useFollowUser,
	useIsFollowing,
	useUnfollowUser,
} from "../../hooks/useFollows";

interface FollowButtonProps {
	userId: number;
	size?: "sm" | "md";
	className?: string;
}

function isTouchDevice() {
	return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export default function FollowButton({
	userId,
	size = "md",
	className,
}: FollowButtonProps) {
	const { user, isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const { isFollowing, isLoading } = useIsFollowing(userId);
	const followMutation = useFollowUser();
	const unfollowMutation = useUnfollowUser();

	const [isHovered, setIsHovered] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);

	const isMe = user?.id === userId;
	const isPending = followMutation.isPending || unfollowMutation.isPending;

	if (isMe) {
		return null;
	}

	const handleFollow = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isAuthenticated) {
			navigate({ to: "/login" });
			return;
		}
		followMutation.mutate(userId);
	};

	const handleUnfollow = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (isTouchDevice()) {
			setShowConfirmDialog(true);
		} else {
			unfollowMutation.mutate(userId);
		}
	};

	const confirmUnfollow = () => {
		unfollowMutation.mutate(userId);
		setShowConfirmDialog(false);
	};

	const buttonSize = size === "sm" ? "xs" : "sm";
	const showUnfollowState = isFollowing && isHovered;

	if (isLoading) {
		return (
			<Button
				size={buttonSize}
				variant="outline"
				disabled
				className={cn("min-w-[72px]", className)}
			>
				...
			</Button>
		);
	}

	if (isFollowing) {
		return (
			<>
				<Button
					size={buttonSize}
					variant={showUnfollowState ? "destructive-outline" : "secondary"}
					onClick={handleUnfollow}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					disabled={isPending}
					className={cn("min-w-[72px] gap-1.5", className)}
				>
					{showUnfollowState ? (
						"取消关注"
					) : (
						<>
							<Check className="h-3.5 w-3.5" />
							已关注
						</>
					)}
				</Button>
				<ConfirmDialog
					open={showConfirmDialog}
					onOpenChange={setShowConfirmDialog}
					title="取消关注"
					description="确定要取消关注此用户吗？"
					confirmLabel="取消关注"
					variant="destructive"
					onConfirm={confirmUnfollow}
					isConfirming={unfollowMutation.isPending}
				/>
			</>
		);
	}

	return (
		<Button
			size={buttonSize}
			variant="default"
			onClick={handleFollow}
			disabled={isPending}
			className={cn("min-w-[72px]", className)}
		>
			关注
		</Button>
	);
}
