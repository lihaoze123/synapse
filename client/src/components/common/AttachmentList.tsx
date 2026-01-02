import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Attachment } from "@/types";

interface AttachmentListProps {
	attachments: Attachment[];
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

export function AttachmentList({
	attachments,
	className,
}: AttachmentListProps) {
	if (!attachments || attachments.length === 0) {
		return null;
	}

	const staticBaseUrl = import.meta.env.VITE_STATIC_BASE_URL || "";

	return (
		<div className={cn("space-y-1", className)}>
			<span className="text-xs text-muted-foreground">附件</span>
			{attachments.map((attachment) => (
				<div
					key={attachment.id}
					className="flex items-center gap-2 rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm"
				>
					<span>{getFileIcon(attachment.contentType)}</span>
					<span className="flex-1 truncate">{attachment.filename}</span>
					<span className="text-muted-foreground shrink-0">
						{formatFileSize(attachment.fileSize)}
					</span>
					<a
						href={`${staticBaseUrl}${attachment.url}`}
						download={attachment.filename}
						className="text-primary hover:text-primary/80 transition-colors"
						title="下载"
					>
						<Download className="h-4 w-4" />
					</a>
				</div>
			))}
		</div>
	);
}
