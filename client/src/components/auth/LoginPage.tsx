import { Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { emailValidationError, isValidEmail } from "@/utils/validation";
import { OAuthButton } from "./OAuthButton";

interface AuthInputConfig {
	id: string;
	label: string;
	type: string;
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	disabled?: boolean;
}

function AuthInput({
	id,
	label,
	type,
	placeholder,
	value,
	onChange,
	error,
	disabled,
}: AuthInputConfig) {
	return (
		<div className="space-y-2">
			<label htmlFor={id} className="block text-sm font-medium text-gray-700">
				{label}
			</label>
			<input
				id={id}
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 disabled:opacity-50"
			/>
			{error && <p className="text-sm text-red-500">{error}</p>}
		</div>
	);
}

export function LoginPage() {
	const auth = useAuth();

	const [mode, setMode] = useState<"login" | "register">("login");
	const [loginData, setLoginData] = useState({ username: "", password: "" });
	const [registerData, setRegisterData] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
	const [registerErrors, setRegisterErrors] = useState<Record<string, string>>(
		{},
	);
	const [apiError, setApiError] = useState<string | null>(null);

	const loginUsernameId = useId();
	const loginPasswordId = useId();
	const regUsernameId = useId();
	const regEmailId = useId();
	const regPasswordId = useId();
	const regConfirmId = useId();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setApiError(null);
		const errors: Record<string, string> = {};

		if (!loginData.username.trim()) errors.username = "Username is required";
		if (!loginData.password) errors.password = "Password is required";

		if (Object.keys(errors).length > 0) {
			setLoginErrors(errors);
			return;
		}

		setLoginErrors({});
		try {
			await auth.login(loginData);
		} catch (err) {
			setApiError(err instanceof Error ? err.message : "Login failed");
		}
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setApiError(null);
		const errors: Record<string, string> = {};

		if (!registerData.username.trim()) errors.username = "Username is required";
		if (!registerData.email.trim()) errors.email = "Email is required";
		else if (!isValidEmail(registerData.email))
			errors.email = emailValidationError;
		if (!registerData.password) errors.password = "Password is required";
		else if (registerData.password.length < 6)
			errors.password = "Password must be at least 6 characters";
		if (registerData.password !== registerData.confirmPassword)
			errors.confirmPassword = "Passwords do not match";

		if (Object.keys(errors).length > 0) {
			setRegisterErrors(errors);
			return;
		}

		setRegisterErrors({});
		try {
			await auth.register({
				username: registerData.username,
				email: registerData.email,
				password: registerData.password,
			});
		} catch (err) {
			setApiError(err instanceof Error ? err.message : "Registration failed");
		}
	};

	const isLoading = auth.isLoggingIn || auth.isRegistering;

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 py-12">
			{/* Login Card */}
			<div className="w-full max-w-md">
				<div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-2xl font-semibold text-gray-900 mb-2">
							{mode === "login" ? "Welcome back" : "Create account"}
						</h1>
						<p className="text-gray-500 text-sm">
							{mode === "login"
								? "Sign in to continue to Synapse"
								: "Join the community today"}
						</p>
					</div>

					{/* API Error */}
					{apiError && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
							{apiError}
						</div>
					)}

					{/* OAuth Buttons */}
					<div className="space-y-3 mb-6">
						<OAuthButton
							provider="github"
							onClick={auth.loginWithGitHub}
							isLoading={isLoading}
						/>
						<OAuthButton
							provider="google"
							onClick={auth.loginWithGoogle}
							isLoading={isLoading}
						/>
					</div>

					{/* Divider */}
					<div className="relative mb-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-200" />
						</div>
						<div className="relative flex justify-center">
							<span className="px-4 bg-white text-sm text-gray-500">
								or continue with email
							</span>
						</div>
					</div>

					{/* Forms */}
					{mode === "login" ? (
						<form onSubmit={handleLogin} className="space-y-4">
							<AuthInput
								id={loginUsernameId}
								label="Username"
								type="text"
								placeholder="Enter your username"
								value={loginData.username}
								onChange={(v) => setLoginData({ ...loginData, username: v })}
								error={loginErrors.username}
								disabled={isLoading}
							/>
							<AuthInput
								id={loginPasswordId}
								label="Password"
								type="password"
								placeholder="Enter your password"
								value={loginData.password}
								onChange={(v) => setLoginData({ ...loginData, password: v })}
								error={loginErrors.password}
								disabled={isLoading}
							/>
							<button
								type="submit"
								disabled={isLoading}
								className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{auth.isLoggingIn && (
									<Loader2 className="w-4 h-4 animate-spin" />
								)}
								Sign In
							</button>
						</form>
					) : (
						<form onSubmit={handleRegister} className="space-y-4">
							<AuthInput
								id={regUsernameId}
								label="Username"
								type="text"
								placeholder="Choose a username"
								value={registerData.username}
								onChange={(v) =>
									setRegisterData({ ...registerData, username: v })
								}
								error={registerErrors.username}
								disabled={isLoading}
							/>
							<AuthInput
								id={regEmailId}
								label="Email"
								type="email"
								placeholder="Enter your email"
								value={registerData.email}
								onChange={(v) => setRegisterData({ ...registerData, email: v })}
								error={registerErrors.email}
								disabled={isLoading}
							/>
							<AuthInput
								id={regPasswordId}
								label="Password"
								type="password"
								placeholder="Create a password"
								value={registerData.password}
								onChange={(v) =>
									setRegisterData({ ...registerData, password: v })
								}
								error={registerErrors.password}
								disabled={isLoading}
							/>
							<AuthInput
								id={regConfirmId}
								label="Confirm Password"
								type="password"
								placeholder="Confirm your password"
								value={registerData.confirmPassword}
								onChange={(v) =>
									setRegisterData({ ...registerData, confirmPassword: v })
								}
								error={registerErrors.confirmPassword}
								disabled={isLoading}
							/>
							<button
								type="submit"
								disabled={isLoading}
								className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{auth.isRegistering && (
									<Loader2 className="w-4 h-4 animate-spin" />
								)}
								Create Account
							</button>
						</form>
					)}

					{/* Toggle Mode */}
					<p className="mt-6 text-center text-gray-500 text-sm">
						{mode === "login"
							? "Don't have an account?"
							: "Already have an account?"}{" "}
						<button
							type="button"
							onClick={() => {
								setMode(mode === "login" ? "register" : "login");
								setApiError(null);
								setLoginErrors({});
								setRegisterErrors({});
							}}
							className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
						>
							{mode === "login" ? "Sign up" : "Sign in"}
						</button>
					</p>
				</div>
			</div>
		</div>
	);
}
