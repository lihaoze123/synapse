import { createFileRoute } from "@tanstack/react-router";
import { Hash } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardPanel,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldControl, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function LoginPage() {
	const { login, register, isLoggingIn, isRegistering } = useAuth();
	const [isRegisterMode, setIsRegisterMode] = useState(false);
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		try {
			if (isRegisterMode) {
				await register(formData);
			} else {
				await login(formData);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "发生错误");
		}
	};

	const isPending = isLoggingIn || isRegistering;

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
						<Hash className="h-7 w-7" />
					</div>
					<CardTitle className="text-2xl">
						{isRegisterMode ? "创建账户" : "欢迎回来"}
					</CardTitle>
					<CardDescription>
						{isRegisterMode
							? "注册以开始分享你的知识"
							: "登录你的 Synapse 账户"}
					</CardDescription>
				</CardHeader>

				<CardPanel>
					<Form onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
								{error}
							</div>
						)}

						<Field>
							<FieldLabel>用户名</FieldLabel>
							<FieldControl
								name="username"
								type="text"
								placeholder="请输入用户名"
								value={formData.username}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setFormData((prev) => ({ ...prev, username: e.target.value }))
								}
								required
							/>
						</Field>

						<Field>
							<FieldLabel>密码</FieldLabel>
							<FieldControl
								name="password"
								type="password"
								placeholder="请输入密码"
								value={formData.password}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setFormData((prev) => ({ ...prev, password: e.target.value }))
								}
								required
							/>
						</Field>

						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? "请稍候..." : isRegisterMode ? "创建账户" : "登录"}
						</Button>
					</Form>
				</CardPanel>

				<CardFooter className="justify-center">
					<p className="text-sm text-muted-foreground">
						{isRegisterMode ? "已有账户？" : "还没有账户？"}{" "}
						<button
							type="button"
							onClick={() => setIsRegisterMode(!isRegisterMode)}
							className="font-medium text-primary hover:underline"
						>
							{isRegisterMode ? "立即登录" : "立即注册"}
						</button>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
