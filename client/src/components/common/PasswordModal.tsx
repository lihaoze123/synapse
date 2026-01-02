import { Lock, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PasswordModalProps {
	open: boolean;
	onSubmit: (password: string) => void;
	onCancel: () => void;
	isLoading?: boolean;
	error?: string;
}

export function PasswordModal({
	open,
	onSubmit,
	onCancel,
	isLoading,
	error,
}: PasswordModalProps) {
	const [password, setPassword] = useState("");

	if (!open) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (password.trim()) {
			onSubmit(password);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<Card className="w-full max-w-sm p-6">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
							<Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
						</div>
						<h2 className="text-lg font-semibold">私密内容</h2>
					</div>
					<button
						type="button"
						onClick={onCancel}
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<p className="text-sm text-muted-foreground mb-4">
					此帖子已设为私密，请输入密码查看内容
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Input
							type="password"
							placeholder="输入密码"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							autoFocus
							disabled={isLoading}
						/>
						{error && <p className="text-sm text-destructive mt-2">{error}</p>}
					</div>

					<div className="flex gap-2 justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							disabled={isLoading}
						>
							返回
						</Button>
						<Button type="submit" disabled={!password.trim() || isLoading}>
							{isLoading ? "验证中..." : "确认"}
						</Button>
					</div>
				</form>
			</Card>
		</div>
	);
}
