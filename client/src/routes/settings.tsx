import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Layout } from "@/components/layout";
import AvatarUpload from "@/components/profile/AvatarUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUpdateProfile } from "@/hooks";
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
	const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [username, setUsername] = useState(user?.username ?? "");
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
		username !== user.username || avatarUrl !== (user.avatarUrl ?? "");
	const isUsernameValid = username.length >= 3 && username.length <= 20;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!hasChanges || !isUsernameValid) return;

		try {
			await updateProfile.mutateAsync({
				username: username !== user.username ? username : undefined,
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
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							placeholder="输入用户名"
							minLength={3}
							maxLength={20}
						/>
						{username.length > 0 && !isUsernameValid && (
							<p className="text-sm text-destructive">
								用户名长度需要在 3-20 个字符之间
							</p>
						)}
					</div>

					<div className="flex items-center gap-3">
						<Button
							type="submit"
							disabled={
								!hasChanges || !isUsernameValid || updateProfile.isPending
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
		</Layout>
	);
}
