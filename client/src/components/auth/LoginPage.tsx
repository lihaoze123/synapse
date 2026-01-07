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

		if (!loginData.username.trim()) errors.username = "请输入用户名";
		if (!loginData.password) errors.password = "请输入密码";

		if (Object.keys(errors).length > 0) {
			setLoginErrors(errors);
			return;
		}

		setLoginErrors({});
		try {
			await auth.login(loginData);
		} catch (err) {
			setApiError(err instanceof Error ? err.message : "登录失败");
		}
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setApiError(null);
		const errors: Record<string, string> = {};

		if (!registerData.username.trim()) errors.username = "请输入用户名";
		if (!registerData.email.trim()) errors.email = "请输入邮箱";
		else if (!isValidEmail(registerData.email))
			errors.email = emailValidationError;
		if (!registerData.password) errors.password = "请输入密码";
		else if (registerData.password.length < 6)
			errors.password = "密码长度至少 6 位";
		if (registerData.password !== registerData.confirmPassword)
			errors.confirmPassword = "两次密码不一致";

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
			setApiError(err instanceof Error ? err.message : "注册失败");
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
							{mode === "login" ? "欢迎回来" : "创建账户"}
						</h1>
						<p className="text-gray-500 text-sm">
							{mode === "login" ? "登录 Synapse 继续探索" : "加入我们的社区"}
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
								或使用邮箱继续
							</span>
						</div>
					</div>

					{/* Forms */}
					{mode === "login" ? (
						<form onSubmit={handleLogin} className="space-y-4">
							<AuthInput
								id={loginUsernameId}
								label="用户名"
								type="text"
								placeholder="请输入用户名"
								value={loginData.username}
								onChange={(v) => setLoginData({ ...loginData, username: v })}
								error={loginErrors.username}
								disabled={isLoading}
							/>
							<AuthInput
								id={loginPasswordId}
								label="密码"
								type="password"
								placeholder="请输入密码"
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
								登录
							</button>
						</form>
					) : (
						<form onSubmit={handleRegister} className="space-y-4">
							<AuthInput
								id={regUsernameId}
								label="用户名"
								type="text"
								placeholder="请输入用户名"
								value={registerData.username}
								onChange={(v) =>
									setRegisterData({ ...registerData, username: v })
								}
								error={registerErrors.username}
								disabled={isLoading}
							/>
							<AuthInput
								id={regEmailId}
								label="邮箱"
								type="email"
								placeholder="请输入邮箱"
								value={registerData.email}
								onChange={(v) => setRegisterData({ ...registerData, email: v })}
								error={registerErrors.email}
								disabled={isLoading}
							/>
							<AuthInput
								id={regPasswordId}
								label="密码"
								type="password"
								placeholder="请设置密码"
								value={registerData.password}
								onChange={(v) =>
									setRegisterData({ ...registerData, password: v })
								}
								error={registerErrors.password}
								disabled={isLoading}
							/>
							<AuthInput
								id={regConfirmId}
								label="确认密码"
								type="password"
								placeholder="请再次输入密码"
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
								注册账户
							</button>
						</form>
					)}

					{/* Toggle Mode */}
					<p className="mt-6 text-center text-gray-500 text-sm">
						{mode === "login" ? "还没有账户？" : "已有账户？"}{" "}
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
							{mode === "login" ? "立即注册" : "去登录"}
						</button>
					</p>
				</div>
			</div>
		</div>
	);
}
