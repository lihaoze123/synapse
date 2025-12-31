import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { userService } from "@/services/users";

interface AvatarUploadProps {
	currentAvatarUrl: string | null;
	username: string;
	onUpload: (url: string) => void;
	className?: string;
}

export default function AvatarUpload({
	currentAvatarUrl,
	username,
	onUpload,
	className,
}: AvatarUploadProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	const displayUrl = previewUrl || currentAvatarUrl;

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			setError("请选择图片文件");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			setError("图片大小不能超过 5MB");
			return;
		}

		setError(null);
		setIsUploading(true);

		const localPreview = URL.createObjectURL(file);
		setPreviewUrl(localPreview);

		try {
			const result = await userService.uploadFile(file);
			onUpload(result.url);
		} catch (err) {
			setError(err instanceof Error ? err.message : "上传失败");
			setPreviewUrl(null);
		} finally {
			setIsUploading(false);
		}
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className={cn("flex flex-col items-center gap-3", className)}>
			<div className="relative">
				<Avatar className="h-24 w-24 ring-4 ring-border/30">
					<AvatarImage src={displayUrl || undefined} alt={username} />
					<AvatarFallback className="text-2xl font-medium">
						{username.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				{isUploading && (
					<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
					</div>
				)}
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				className="hidden"
				aria-label="选择头像图片"
			/>

			<Button
				variant="outline"
				size="sm"
				onClick={handleClick}
				disabled={isUploading}
			>
				<Camera className="mr-1.5 h-4 w-4" />
				{isUploading ? "上传中..." : "更换头像"}
			</Button>

			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
