import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Layout } from "@/components/layout";
import AvatarUpload from "@/components/profile/AvatarUpload";
import { AnimatedPage } from "@/components/ui/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUpdateProfile } from "@/hooks";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";

export const Route = createFileRoute("/settings")({
	beforeLoad: () => {
		if (!authService.isAuthenticated()) {
			throw redirect({ to: "/login" });
		}
	},
	component: SettingsPage,
	staticData: {
		breadcrumb: {
			label: "设置",
		},
	},
});

function SettingsPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const updateProfile = useUpdateProfile();
	const usernameInputId = useId();
	const displayNameInputId = useId();
	const bioInputId = useId();
	const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [displayName, setDisplayName] = useState(user?.displayName ?? "");
	const [bio, setBio] = useState(user?.bio ?? "");
	const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		return () => {
			if (successTimeoutRef.current) {
				clearTimeout(successTimeoutRef.current);
			}
		};
	}, []);

	if (!user) {
		return null;
	}

	const hasChanges =
		displayName !== (user.displayName ?? "") ||
		bio !== (user.bio ?? "") ||
		avatarUrl !== (user.avatarUrl ?? "");
	const isDisplayNameValid =
		displayName.length >= 1 && displayName.length <= 50;
	const isBioValid = bio.length <= 500;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!hasChanges || !isDisplayNameValid || !isBioValid) return;

		try {
			await updateProfile.mutateAsync({
				displayName:
					displayName !== (user.displayName ?? "") ? displayName : undefined,
				bio: bio !== (user.bio ?? "") ? bio : undefined,
				avatarUrl: avatarUrl !== (user.avatarUrl ?? "") ? avatarUrl : undefined,
			});
			setSuccess(true);
			if (successTimeoutRef.current) {
				clearTimeout(successTimeoutRef.current);
			}
			successTimeoutRef.current = setTimeout(() => setSuccess(false), 2000);
		} catch {}
	};

	const handleAvatarUpload = (url: string) => {
		setAvatarUrl(url);
	};

	return (
		<Layout>
			<AnimatedPage transition="slideUp">
				<div className="max-w-lg mx-auto">
					<div className="flex items-center gap-3 mb-6">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => navigate({ to: "/profile" })}
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<h1 className="text-xl font-semibold">个人资料设置</h1>
					</div>

					<form
						onSubmit={handleSubmit}
						className="space-y-8 bg-card rounded-xl border p-6 shadow-sm"
					>
						<div className="space-y-2">
							<Label>头像</Label>
							<AvatarUpload
								currentAvatarUrl={avatarUrl || user.avatarUrl}
								username={user.username}
								onUpload={handleAvatarUpload}
								className="py-4"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor={usernameInputId}>用户名</Label>
							<Input
								id={usernameInputId}
								value={user.username}
								disabled
								className="bg-muted cursor-not-allowed opacity-60"
							/>
							<p className="text-xs text-muted-foreground">
								用户名创建后不可更改
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor={displayNameInputId}>显示名</Label>
							<Input
								id={displayNameInputId}
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								placeholder="输入显示名"
								maxLength={50}
							/>
							{displayName.length > 0 && !isDisplayNameValid && (
								<p className="text-sm text-destructive">
									显示名长度需要在 1-50 个字符之间
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor={bioInputId}>个人简介</Label>
							<textarea
								id={bioInputId}
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								placeholder="介绍一下自己..."
								rows={4}
								maxLength={500}
								className={cn(
									"w-full resize-none rounded-md border border-input bg-background",
									"px-3 py-2 text-sm",
									"placeholder:text-muted-foreground",
									"focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
									"transition-shadow duration-200",
								)}
							/>
							<div className="flex items-center justify-between">
								<p className="text-xs text-muted-foreground">
									{bio.length}/500
								</p>
								{!isBioValid && (
									<p className="text-sm text-destructive">
										个人简介不能超过 500 个字符
									</p>
								)}
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Button
								type="submit"
								disabled={
									!hasChanges ||
									!isDisplayNameValid ||
									!isBioValid ||
									updateProfile.isPending
								}
							>
								{updateProfile.isPending ? (
									<>
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
										保存中...
									</>
								) : success ? (
									<>
										<Check className="h-4 w-4" />
										已保存
									</>
								) : (
									"保存修改"
								)}
							</Button>

							{updateProfile.error && (
								<p className="text-sm text-destructive">
									{updateProfile.error.message}
								</p>
							)}
						</div>
					</form>
				</div>
			</AnimatedPage>
		</Layout>
	);
}
