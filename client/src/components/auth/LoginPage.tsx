import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
	const {
		login,
		register,
		loginWithGitHub,
		loginWithGoogle,
		isLoggingIn,
		isRegistering,
	} = useAuth();
	const [loginError, setLoginError] = useState<string | null>(null);
	const [registerError, setRegisterError] = useState<string | null>(null);

	const handleLogin = async (data: { username: string; password: string }) => {
		setLoginError(null);
		try {
			await login(data);
		} catch (err) {
			setLoginError(err instanceof Error ? err.message : "Login failed");
		}
	};

	const handleRegister = async (data: {
		username: string;
		email: string;
		password: string;
	}) => {
		setRegisterError(null);
		try {
			await register(data);
		} catch (err) {
			setRegisterError(
				err instanceof Error ? err.message : "Registration failed",
			);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
			<Card className="w-full max-w-md shadow-xl">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-bold">
						Welcome to Synapse
					</CardTitle>
					<CardDescription>
						Connect, share, and discover knowledge
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="login" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="login">Sign In</TabsTrigger>
							<TabsTrigger value="register">Sign Up</TabsTrigger>
						</TabsList>
						<TabsContent value="login" className="mt-6">
							<LoginForm
								onSubmit={handleLogin}
								onOAuthLogin={{
									github: loginWithGitHub,
									google: loginWithGoogle,
								}}
								isLoading={isLoggingIn}
								error={loginError}
							/>
						</TabsContent>
						<TabsContent value="register" className="mt-6">
							<RegisterForm
								onSubmit={handleRegister}
								onOAuthLogin={{
									github: loginWithGitHub,
									google: loginWithGoogle,
								}}
								isLoading={isRegistering}
								error={registerError}
							/>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
