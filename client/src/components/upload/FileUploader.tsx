import { Loader2, Paperclip, X } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { userService } from "@/services/users";

export interface UploadedAttachment {
	filename: string;
	storedName: string;
	url: string;
	fileSize: number;
	contentType: string;
}

interface UploadingFile {
	file: File;
	progress: number;
	error?: string;
}

interface FileUploaderProps {
	maxFiles?: number;
	maxSize?: number;
	value?: UploadedAttachment[];
	onChange?: (attachments: UploadedAttachment[]) => void;
	disabled?: boolean;
	className?: string;
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(contentType: string): string {
	if (contentType.includes("pdf")) return "📄";
	if (contentType.includes("word") || contentType.includes("document"))
		return "📝";
	if (contentType.includes("sheet") || contentType.includes("excel"))
		return "📊";
	if (
		contentType.includes("presentation") ||
		contentType.includes("powerpoint")
	)
		return "📽️";
	if (
		contentType.includes("zip") ||
		contentType.includes("rar") ||
		contentType.includes("7z")
	)
		return "📦";
	if (contentType.startsWith("text/")) return "📃";
	return "📎";
}

export function FileUploader({
	maxFiles = 3,
	maxSize = 5 * 1024 * 1024,
	value = [],
	onChange,
	disabled = false,
	className,
}: FileUploaderProps) {
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState<UploadingFile[]>([]);
	const [error, setError] = useState<string | null>(null);

	const canAddMore = !disabled && value.length + uploading.length < maxFiles;

	const validateFile = useCallback(
		(file: File): string | null => {
			if (file.size > maxSize) {
				return `文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`;
			}
			return null;
		},
		[maxSize],
	);

	const uploadFile = useCallback(
		async (file: File) => {
			try {
				const result = await userService.uploadAttachment(file);
				setUploading((prev) => prev.filter((item) => item.file !== file));
				onChange?.([...value, result]);
			} catch (err) {
				setUploading((prev) =>
					prev.map((item) =>
						item.file === file
							? {
									...item,
									error: err instanceof Error ? err.message : "上传失败",
								}
							: item,
					),
				);
			}
		},
		[value, onChange],
	);

	const handleFiles = useCallback(
		(files: FileList | File[]) => {
			setError(null);
			const fileArray = Array.from(files);
			const remainingSlots = maxFiles - value.length - uploading.length;

			if (remainingSlots <= 0) {
				setError(`最多只能上传 ${maxFiles} 个附件`);
				return;
			}

			const filesToProcess = fileArray.slice(0, remainingSlots);

			for (const file of filesToProcess) {
				const validationError = validateFile(file);
				if (validationError) {
					setError(validationError);
					continue;
				}

				const uploadingFile: UploadingFile = { file, progress: 0 };
				setUploading((prev) => [...prev, uploadingFile]);
				uploadFile(file);
			}
		},
		[maxFiles, value.length, uploading.length, validateFile, uploadFile],
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.length) {
			handleFiles(e.target.files);
		}
		e.target.value = "";
	};

	const handleRemove = (storedName: string) => {
		onChange?.(value.filter((v) => v.storedName !== storedName));
	};

	const handleRemoveUploading = (file: File) => {
		setUploading((prev) => prev.filter((i) => i.file !== file));
	};

	return (
		<div className={cn("space-y-2", className)}>
			<input
				ref={inputRef}
				id={inputId}
				type="file"
				multiple
				onChange={handleInputChange}
				className="hidden"
				disabled={disabled}
			/>

			{value.length > 0 && (
				<div className="space-y-1">
					{value.map((attachment) => (
						<div
							key={attachment.storedName}
							className="flex items-center gap-2 rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm"
						>
							<span>{getFileIcon(attachment.contentType)}</span>
							<span className="flex-1 truncate">{attachment.filename}</span>
							<span className="text-muted-foreground shrink-0">
								{formatFileSize(attachment.fileSize)}
							</span>
							{!disabled && (
								<button
									type="button"
									onClick={() => handleRemove(attachment.storedName)}
									className="text-muted-foreground hover:text-destructive transition-colors"
								>
									<X className="h-4 w-4" />
								</button>
							)}
						</div>
					))}
				</div>
			)}

			{uploading.map((item) => (
				<div
					key={item.file.name}
					className={cn(
						"flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
						item.error
							? "border-destructive bg-destructive/10"
							: "border-input bg-muted/30",
					)}
				>
					{item.error ? (
						<>
							<span className="flex-1 truncate text-destructive">
								{item.error}
							</span>
							<button
								type="button"
								onClick={() => handleRemoveUploading(item.file)}
								className="text-destructive"
							>
								<X className="h-4 w-4" />
							</button>
						</>
					) : (
						<>
							<Loader2 className="h-4 w-4 animate-spin text-primary" />
							<span className="flex-1 truncate">{item.file.name}</span>
							<span className="text-muted-foreground">上传中...</span>
						</>
					)}
				</div>
			))}

			{canAddMore && (
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					className={cn(
						"flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/25 px-3 py-2 text-sm",
						"text-muted-foreground hover:border-primary/50 hover:bg-muted/50 transition-colors",
						"w-full justify-center",
					)}
				>
					<Paperclip className="h-4 w-4" />
					<span>添加附件（最多 {maxFiles} 个，单个不超过 5MB）</span>
				</button>
			)}

			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
}
