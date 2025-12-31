import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
	const [focusedField, setFocusedField] = useState<string | null>(null);

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
		<div className="login-page">
			{/* Subtle Background Pattern */}
			<div className="bg-pattern" />

			{/* Centered Card */}
			<div className="login-card">
				{/* Header */}
				<div className="card-header">
					<h1 className="title">{isRegisterMode ? "创建账户" : "欢迎回来"}</h1>
					<p className="subtitle">
						{isRegisterMode ? "加入 Synapse，连接知识网络" : "登录你的 Synapse 账户"}
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="form">
					{error && (
						<div className="error-box">
							<svg viewBox="0 0 20 20" fill="currentColor">
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clipRule="evenodd"
								/>
							</svg>
							<span>{error}</span>
						</div>
					)}

					<div className={`field ${focusedField === "username" ? "focused" : ""}`}>
						<label htmlFor="username">用户名</label>
						<input
							id="username"
							name="username"
							type="text"
							placeholder="请输入用户名"
							value={formData.username}
							onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
							onFocus={() => setFocusedField("username")}
							onBlur={() => setFocusedField(null)}
							required
							autoComplete="username"
						/>
					</div>

					<div className={`field ${focusedField === "password" ? "focused" : ""}`}>
						<label htmlFor="password">密码</label>
						<input
							id="password"
							name="password"
							type="password"
							placeholder="请输入密码"
							value={formData.password}
							onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
							onFocus={() => setFocusedField("password")}
							onBlur={() => setFocusedField(null)}
							required
							autoComplete={isRegisterMode ? "new-password" : "current-password"}
						/>
					</div>

					<button type="submit" className="submit-btn" disabled={isPending}>
						{isPending ? (
							<>
								<svg className="spinner" viewBox="0 0 24 24">
									<circle
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="3"
										fill="none"
										strokeDasharray="32"
										strokeLinecap="round"
									/>
								</svg>
								处理中...
							</>
						) : isRegisterMode ? (
							"创建账户"
						) : (
							"登录"
						)}
					</button>
				</form>

				{/* Footer */}
				<div className="card-footer">
					<span>{isRegisterMode ? "已有账户？" : "还没有账户？"}</span>
					<button
						type="button"
						onClick={() => {
							setIsRegisterMode(!isRegisterMode);
							setError(null);
						}}
						className="switch-btn"
					>
						{isRegisterMode ? "立即登录" : "立即注册"}
					</button>
				</div>
			</div>

			<style>{`
				.login-page {
					position: fixed;
					inset: 0;
					z-index: 50;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 24px;
					background: #fafafa;
					overflow: hidden;
				}

				/* Subtle grid pattern */
				.bg-pattern {
					position: absolute;
					inset: 0;
					background-image:
						linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px),
						linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px);
					background-size: 48px 48px;
					mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
					-webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
				}

				/* Card */
				.login-card {
					position: relative;
					width: 100%;
					max-width: 400px;
					padding: 48px 40px;
					background: #fff;
					border-radius: 20px;
					box-shadow:
						0 0 0 1px rgba(0,0,0,0.03),
						0 2px 4px rgba(0,0,0,0.02),
						0 12px 24px rgba(0,0,0,0.04),
						0 32px 64px rgba(0,0,0,0.04);
					animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
				}

				@keyframes cardIn {
					from {
						opacity: 0;
						transform: translateY(16px) scale(0.98);
					}
				}

				/* Header */
				.card-header {
					text-align: center;
					margin-bottom: 32px;
				}

				.title {
					font-size: 24px;
					font-weight: 600;
					color: #111;
					margin: 0 0 8px;
					letter-spacing: -0.02em;
				}

				.subtitle {
					font-size: 14px;
					color: #666;
					margin: 0;
				}

				/* Form */
				.form {
					display: flex;
					flex-direction: column;
					gap: 20px;
				}

				.error-box {
					display: flex;
					align-items: center;
					gap: 10px;
					padding: 12px 14px;
					background: #fef2f2;
					border: 1px solid #fecaca;
					border-radius: 10px;
					color: #dc2626;
					font-size: 13px;
				}

				.error-box svg {
					width: 18px;
					height: 18px;
					flex-shrink: 0;
				}

				/* Field */
				.field {
					display: flex;
					flex-direction: column;
					gap: 8px;
				}

				.field label {
					font-size: 13px;
					font-weight: 500;
					color: #333;
				}

				.field.focused label {
					color: hsl(35, 90%, 42%);
				}

				.field input {
					height: 48px;
					padding: 0 16px;
					font-size: 15px;
					color: #111;
					background: #fafafa;
					border: 1.5px solid #e5e5e5;
					border-radius: 10px;
					outline: none;
					transition: all 0.2s ease;
				}

				.field input::placeholder {
					color: #aaa;
				}

				.field input:hover {
					border-color: #d0d0d0;
				}

				.field.focused input {
					background: #fff;
					border-color: hsl(35, 90%, 48%);
					box-shadow: 0 0 0 3px hsla(35, 90%, 48%, 0.1);
				}

				/* Submit Button */
				.submit-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 8px;
					height: 48px;
					margin-top: 8px;
					font-size: 15px;
					font-weight: 600;
					color: #fff;
					background: hsl(35, 90%, 48%);
					border: none;
					border-radius: 10px;
					cursor: pointer;
					transition: all 0.2s ease;
				}

				.submit-btn:hover:not(:disabled) {
					background: hsl(35, 90%, 42%);
					transform: translateY(-1px);
					box-shadow: 0 4px 12px hsla(35, 90%, 48%, 0.3);
				}

				.submit-btn:active:not(:disabled) {
					transform: translateY(0);
				}

				.submit-btn:disabled {
					opacity: 0.7;
					cursor: not-allowed;
				}

				.spinner {
					width: 18px;
					height: 18px;
					animation: spin 1s linear infinite;
				}

				@keyframes spin {
					to { transform: rotate(360deg); }
				}

				/* Footer */
				.card-footer {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 6px;
					margin-top: 28px;
					padding-top: 24px;
					border-top: 1px solid #eee;
					font-size: 13px;
					color: #666;
				}

				.switch-btn {
					background: none;
					border: none;
					color: hsl(35, 90%, 42%);
					font-size: 13px;
					font-weight: 600;
					cursor: pointer;
					padding: 0;
				}

				.switch-btn:hover {
					text-decoration: underline;
				}

				/* Responsive */
				@media (max-width: 480px) {
					.login-card {
						padding: 36px 24px;
					}

					.title {
						font-size: 22px;
					}
				}

				/* Dark Mode */
				@media (prefers-color-scheme: dark) {
					.login-page {
						background: #0a0a0a;
					}

					.bg-pattern {
						background-image:
							linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
							linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
					}

					.login-card {
						background: #141414;
						box-shadow:
							0 0 0 1px rgba(255,255,255,0.05),
							0 12px 24px rgba(0,0,0,0.3),
							0 32px 64px rgba(0,0,0,0.3);
					}

					.title {
						color: #f5f5f5;
					}

					.subtitle {
						color: #888;
					}

					.field label {
						color: #ccc;
					}

					.field.focused label {
						color: hsl(35, 90%, 55%);
					}

					.field input {
						background: #1a1a1a;
						border-color: #2a2a2a;
						color: #f5f5f5;
					}

					.field input::placeholder {
						color: #555;
					}

					.field input:hover {
						border-color: #3a3a3a;
					}

					.field.focused input {
						background: #1f1f1f;
						border-color: hsl(35, 90%, 50%);
						box-shadow: 0 0 0 3px hsla(35, 90%, 50%, 0.15);
					}

					.submit-btn {
						background: hsl(35, 90%, 50%);
						color: #0a0a0a;
					}

					.submit-btn:hover:not(:disabled) {
						background: hsl(35, 90%, 55%);
					}

					.card-footer {
						border-top-color: #222;
						color: #888;
					}

					.switch-btn {
						color: hsl(35, 90%, 55%);
					}

					.error-box {
						background: rgba(220, 38, 38, 0.1);
						border-color: rgba(220, 38, 38, 0.2);
						color: #f87171;
					}
				}
			`}</style>
		</div>
	);
}
