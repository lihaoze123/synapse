import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Code, FileText, MessageCircle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAllTags } from "@/hooks";
import { cn } from "@/lib/utils";
import type { PostType } from "@/types";
import ArticleEditor from "./ArticleEditor";
import MomentEditor from "./MomentEditor";
import SnippetEditor from "./SnippetEditor";
import TagInput from "./TagInput";

interface PublishModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialType?: PostType;
	onPublish: (data: PublishData) => void;
	isPublishing?: boolean;
	error?: string;
}

export interface PublishData {
	type: PostType;
	title?: string;
	content: string;
	language?: string;
	tags: string[];
}

const TABS = [
	{ type: "MOMENT" as PostType, icon: MessageCircle, label: "动态" },
	{ type: "SNIPPET" as PostType, icon: Code, label: "代码" },
	{ type: "ARTICLE" as PostType, icon: FileText, label: "文章" },
];

export default function PublishModal({
	open,
	onOpenChange,
	initialType = "MOMENT",
	onPublish,
	isPublishing = false,
	error,
}: PublishModalProps) {
	const [activeType, setActiveType] = useState<PostType>(initialType);
	const [tags, setTags] = useState<string[]>([]);

	// Sync activeType with initialType when modal opens
	useEffect(() => {
		if (open) {
			setActiveType(initialType);
		}
	}, [open, initialType]);

	// Fetch tags for suggestions only when modal is open
	const { data: allTags } = useAllTags(open);
	const tagSuggestions = useMemo(
		() => allTags?.map((t) => t.name) ?? [],
		[allTags],
	);

	// Moment state
	const [momentContent, setMomentContent] = useState("");

	// Snippet state
	const [snippetTitle, setSnippetTitle] = useState("");
	const [snippetCode, setSnippetCode] = useState("");
	const [snippetLanguage, setSnippetLanguage] = useState("javascript");

	// Article state
	const [articleTitle, setArticleTitle] = useState("");
	const [articleContent, setArticleContent] = useState("");

	const resetForm = () => {
		setMomentContent("");
		setSnippetTitle("");
		setSnippetCode("");
		setSnippetLanguage("javascript");
		setArticleTitle("");
		setArticleContent("");
		setTags([]);
	};

	const handleClose = () => {
		onOpenChange(false);
		resetForm();
	};

	const handlePublish = () => {
		let data: PublishData;

		switch (activeType) {
			case "MOMENT":
				data = { type: "MOMENT", content: momentContent, tags };
				break;
			case "SNIPPET":
				data = {
					type: "SNIPPET",
					title: snippetTitle || undefined,
					content: snippetCode,
					language: snippetLanguage,
					tags,
				};
				break;
			case "ARTICLE":
				data = {
					type: "ARTICLE",
					title: articleTitle,
					content: articleContent,
					tags,
				};
				break;
		}

		onPublish(data);
	};

	const canPublish = () => {
		switch (activeType) {
			case "MOMENT":
				return momentContent.trim().length > 0;
			case "SNIPPET":
				return snippetCode.trim().length > 0;
			case "ARTICLE":
				return (
					articleTitle.trim().length > 0 && articleContent.trim().length > 0
				);
		}
	};

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity" />
				<DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card shadow-lg data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 transition-all">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-border px-4 py-3">
						<DialogPrimitive.Title className="text-lg font-semibold">
							发布内容
						</DialogPrimitive.Title>
						<DialogPrimitive.Close
							className="rounded-lg p-1 hover:bg-muted transition-colors"
							onClick={handleClose}
						>
							<X className="h-5 w-5" />
						</DialogPrimitive.Close>
					</div>

					{/* Tabs */}
					<div className="flex border-b border-border">
						{TABS.map(({ type, icon: Icon, label }) => (
							<button
								key={type}
								type="button"
								onClick={() => setActiveType(type)}
								className={cn(
									"flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors",
									activeType === type
										? "border-b-2 border-primary text-primary"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								<Icon className="h-4 w-4" />
								{label}
							</button>
						))}
					</div>

					{/* Content */}
					<div className="max-h-[60vh] overflow-y-auto p-4">
						{activeType === "MOMENT" && (
							<MomentEditor
								content={momentContent}
								onChange={setMomentContent}
							/>
						)}

						{activeType === "SNIPPET" && (
							<SnippetEditor
								title={snippetTitle}
								onTitleChange={setSnippetTitle}
								code={snippetCode}
								onCodeChange={setSnippetCode}
								language={snippetLanguage}
								onLanguageChange={setSnippetLanguage}
							/>
						)}

						{activeType === "ARTICLE" && (
							<ArticleEditor
								title={articleTitle}
								onTitleChange={setArticleTitle}
								content={articleContent}
								onContentChange={setArticleContent}
							/>
						)}

						{/* Tags */}
						<div className="mt-4 border-t border-border pt-4">
							<TagInput
								tags={tags}
								onChange={setTags}
								suggestions={tagSuggestions}
							/>
						</div>
					</div>

					{/* Footer */}
					<div className="border-t border-border px-4 py-3">
						{error && (
							<div className="mb-3 p-2 text-sm text-red-600 bg-red-50 rounded-lg">
								发布失败：{error}
							</div>
						)}
						<div className="flex items-center justify-end gap-2">
							<Button variant="outline" onClick={handleClose}>
								取消
							</Button>
							<Button
								onClick={handlePublish}
								disabled={!canPublish() || isPublishing}
							>
								{isPublishing ? "发布中..." : "发布"}
							</Button>
						</div>
					</div>
				</DialogPrimitive.Popup>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
