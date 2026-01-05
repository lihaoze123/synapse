import { Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { OAuthButton } from "./OAuthButton";

interface LoginFormData {
	username: string;
	password: string;
}

interface LoginFormProps {
	onSubmit: (data: LoginFormData) => void | Promise<void>;
	onOAuthLogin: {
		github: () => void;
		google: () => void;
	};
	isLoading?: boolean;
	error?: string | null;
}

export function LoginForm({
	onSubmit,
	onOAuthLogin,
	isLoading,
	error,
}: LoginFormProps) {
	const [formData, setFormData] = useState<LoginFormData>({
		username: "",
		password: "",
	});
	const [errors, setErrors] = useState<
		Partial<Record<keyof LoginFormData, string>>
	>({});
	const usernameId = useId();
	const passwordId = useId();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Partial<Record<keyof LoginFormData, string>> = {};

		if (!formData.username.trim()) {
			newErrors.username = "Username is required";
		}
		if (!formData.password) {
			newErrors.password = "Password is required";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setErrors({});
		await onSubmit(formData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && (
				<div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
					{error}
				</div>
			)}

			<div className="space-y-2">
				<Label htmlFor={usernameId}>Username</Label>
				<Input
					id={usernameId}
					type="text"
					placeholder="Enter your username"
					value={formData.username}
					onChange={(e) =>
						setFormData({ ...formData, username: e.target.value })
					}
					disabled={isLoading}
				/>
				{errors.username && (
					<p className="text-sm text-red-600">{errors.username}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor={passwordId}>Password</Label>
				<Input
					id={passwordId}
					type="password"
					placeholder="Enter your password"
					value={formData.password}
					onChange={(e) =>
						setFormData({ ...formData, password: e.target.value })
					}
					disabled={isLoading}
				/>
				{errors.password && (
					<p className="text-sm text-red-600">{errors.password}</p>
				)}
			</div>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
				Sign In
			</Button>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<Separator />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>

			<div className="space-y-2">
				<OAuthButton
					provider="github"
					onClick={onOAuthLogin.github}
					isLoading={isLoading}
				/>
				<OAuthButton
					provider="google"
					onClick={onOAuthLogin.google}
					isLoading={isLoading}
				/>
			</div>
		</form>
	);
}
