import { ImagePlus, Loader2, X } from "lucide-react";
import {
	type DragEvent,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";
import { userService } from "@/services/users";

interface UploadingFile {
	file: File;
	preview: string;
	progress: number;
	error?: string;
}

interface ImageUploaderProps {
	mode?: "single" | "multiple";
	maxFiles?: number;
	maxSize?: number;
	value?: string[];
	onChange?: (urls: string[]) => void;
	disabled?: boolean;
	className?: string;
	placeholder?: string;
	compact?: boolean;
}

export function ImageUploader({
	mode = "single",
	maxFiles = 9,
	maxSize = 5 * 1024 * 1024,
	value = [],
	onChange,
	disabled = false,
	className,
	placeholder,
	compact = false,
}: ImageUploaderProps) {
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState<UploadingFile[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const allObjectUrls = useRef<Set<string>>(new Set());

	useEffect(() => {
		return () => {
			for (const url of allObjectUrls.current) {
				URL.revokeObjectURL(url);
			}
			allObjectUrls.current.clear();
		};
	}, []);

	const effectiveMaxFiles = mode === "single" ? 1 : maxFiles;
	const canAddMore =
		!disabled && value.length + uploading.length < effectiveMaxFiles;

	const validateFile = useCallback(
		(file: File): string | null => {
			if (!file.type.startsWith("image/")) {
				return "请选择图片文件";
			}
			if (file.size > maxSize) {
				return `图片大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`;
			}
			return null;
		},
		[maxSize],
	);

	const uploadFile = useCallback(
		async (file: File, preview: string) => {
			try {
				const result = await userService.uploadFile(file);

				setUploading((prev) => prev.filter((item) => item.file !== file));
				allObjectUrls.current.delete(preview);
				URL.revokeObjectURL(preview);

				if (mode === "single") {
					onChange?.([result.url]);
				} else {
					onChange?.([...value, result.url]);
				}
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
		[mode, value, onChange],
	);

	const handleFiles = useCallback(
		(files: FileList | File[]) => {
			setError(null);
			const fileArray = Array.from(files);

			const remainingSlots =
				effectiveMaxFiles - value.length - uploading.length;
			if (remainingSlots <= 0) {
				setError(`最多只能上传 ${effectiveMaxFiles} 张图片`);
				return;
			}

			const filesToProcess = fileArray.slice(0, remainingSlots);

			for (const file of filesToProcess) {
				const validationError = validateFile(file);
				if (validationError) {
					setError(validationError);
					continue;
				}

				const preview = URL.createObjectURL(file);
				allObjectUrls.current.add(preview);
				const uploadingFile: UploadingFile = {
					file,
					preview,
					progress: 0,
				};

				setUploading((prev) => [...prev, uploadingFile]);
				uploadFile(file, preview);
			}
		},
		[
			effectiveMaxFiles,
			value.length,
			uploading.length,
			validateFile,
			uploadFile,
		],
	);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.length) {
			handleFiles(e.target.files);
		}
		e.target.value = "";
	};

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
		if (!disabled) {
			setIsDragging(true);
		}
	};

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (!disabled && e.dataTransfer.files.length) {
			handleFiles(e.dataTransfer.files);
		}
	};

	const handleRemove = (url: string) => {
		onChange?.(value.filter((v) => v !== url));
	};

	const handleRemoveUploading = (file: File) => {
		setUploading((prev) => {
			const item = prev.find((i) => i.file === file);
			if (item) {
				allObjectUrls.current.delete(item.preview);
				URL.revokeObjectURL(item.preview);
			}
			return prev.filter((i) => i.file !== file);
		});
	};

	const handleClick = () => {
		if (canAddMore) {
			inputRef.current?.click();
		}
	};

	const renderUploadedImage = (url: string, index: number) => (
		<div key={url} className="group relative aspect-square">
			<img
				src={url}
				alt={`已上传图片 ${index + 1}`}
				className="h-full w-full rounded-lg object-cover"
			/>
			{!disabled && (
				<button
					type="button"
					onClick={() => handleRemove(url)}
					className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100"
					aria-label="删除图片"
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	);

	const renderUploadingImage = (item: UploadingFile) => (
		<div key={item.preview} className="group relative aspect-square">
			<img
				src={item.preview}
				alt="上传中"
				className={cn(
					"h-full w-full rounded-lg object-cover",
					!item.error && "opacity-60",
				)}
			/>
			{!item.error ? (
				<div className="absolute inset-0 flex items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : (
				<>
					<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-destructive/20">
						<span className="text-xs text-destructive">{item.error}</span>
					</div>
					<button
						type="button"
						onClick={() => handleRemoveUploading(item.file)}
						className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md"
						aria-label="移除"
					>
						<X className="h-4 w-4" />
					</button>
				</>
			)}
		</div>
	);

	const renderDropzone = () => (
		<button
			type="button"
			onClick={handleClick}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			disabled={!canAddMore}
			className={cn(
				"flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors",
				isDragging
					? "border-primary bg-primary/5"
					: "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
				!canAddMore && "cursor-not-allowed opacity-50",
			)}
		>
			<ImagePlus className="h-8 w-8 text-muted-foreground" />
			<span className="text-xs text-muted-foreground">
				{placeholder || (mode === "single" ? "上传图片" : "添加图片")}
			</span>
		</button>
	);

	if (compact) {
		const hasImage = value.length > 0;
		const isUploading = uploading.length > 0;

		return (
			<div className={cn("flex items-center gap-2", className)}>
				<input
					ref={inputRef}
					id={inputId}
					type="file"
					accept="image/*"
					onChange={handleInputChange}
					className="hidden"
					disabled={disabled}
				/>
				<button
					type="button"
					onClick={handleClick}
					disabled={disabled || isUploading}
					className={cn(
						"flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm",
						"border border-input bg-background",
						"hover:bg-muted transition-colors",
						(disabled || isUploading) && "opacity-50 cursor-not-allowed",
					)}
				>
					{isUploading ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>上传中...</span>
						</>
					) : (
						<>
							<ImagePlus className="h-4 w-4" />
							<span>{hasImage ? "更换封面" : "添加封面"}</span>
						</>
					)}
				</button>
				{hasImage && !isUploading && (
					<button
						type="button"
						onClick={() => handleRemove(value[0])}
						disabled={disabled}
						className={cn(
							"flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm",
							"text-muted-foreground hover:text-destructive transition-colors",
						)}
					>
						<X className="h-4 w-4" />
					</button>
				)}
				{error && <span className="text-sm text-destructive">{error}</span>}
			</div>
		);
	}

	if (mode === "single") {
		const hasImage = value.length > 0 || uploading.length > 0;

		return (
			<div className={cn("w-full", className)}>
				<input
					ref={inputRef}
					id={inputId}
					type="file"
					accept="image/*"
					onChange={handleInputChange}
					className="hidden"
					disabled={disabled}
				/>

				{!hasImage ? (
					<button
						type="button"
						onClick={handleClick}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						disabled={disabled}
						className={cn(
							"flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors",
							isDragging
								? "border-primary bg-primary/5"
								: "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
							disabled && "cursor-not-allowed opacity-50",
						)}
					>
						<ImagePlus className="h-8 w-8 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">
							{placeholder || "点击或拖拽上传图片"}
						</span>
					</button>
				) : (
					<div className="relative">
						{uploading.length > 0 ? (
							<div className="relative h-32 w-full">
								<img
									src={uploading[0].preview}
									alt="上传中"
									className="h-full w-full rounded-lg object-cover opacity-60"
								/>
								<div className="absolute inset-0 flex items-center justify-center">
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
								</div>
							</div>
						) : (
							<div className="group relative h-32 w-full">
								<img
									src={value[0]}
									alt="已上传图片"
									className="h-full w-full rounded-lg object-cover"
								/>
								{!disabled && (
									<div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
										<button
											type="button"
											onClick={handleClick}
											className="rounded-md bg-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/30"
										>
											更换
										</button>
										<button
											type="button"
											onClick={() => handleRemove(value[0])}
											className="rounded-md bg-destructive/80 px-3 py-1.5 text-sm text-white hover:bg-destructive"
										>
											删除
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{error && <p className="mt-2 text-sm text-destructive">{error}</p>}
			</div>
		);
	}

	return (
		<div className={cn("w-full", className)}>
			<input
				ref={inputRef}
				id={inputId}
				type="file"
				accept="image/*"
				multiple
				onChange={handleInputChange}
				className="hidden"
				disabled={disabled}
			/>

			<div className="grid grid-cols-3 gap-3">
				{value.map((url, index) => renderUploadedImage(url, index))}
				{uploading.map((item) => renderUploadingImage(item))}
				{canAddMore && renderDropzone()}
			</div>

			{error && <p className="mt-2 text-sm text-destructive">{error}</p>}
		</div>
	);
}
