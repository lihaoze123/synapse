import type { PostType } from "@/types";

export interface DraftData {
	type: PostType;
	timestamp: number;
	// MOMENT fields
	momentContent?: string;
	momentImages?: string[];
	// SNIPPET fields
	snippetTitle?: string;
	snippetCode?: string;
	snippetLanguage?: string;
	// ARTICLE fields
	articleTitle?: string;
	articleContent?: string;
	articleCoverImage?: string;
	// Common fields
	tags: string[];
	attachments: Array<{
		filename: string;
		storedName: string;
		url: string;
		fileSize: number;
		contentType: string;
	}>;
	isPrivate: boolean;
	password: string;
}

const DRAFT_KEY_PREFIX = "synapse_draft_";

function getDraftKey(type: PostType): string {
	return `${DRAFT_KEY_PREFIX}${type}`;
}

export function saveDraft(
	type: PostType,
	data: Omit<DraftData, "type" | "timestamp">,
): void {
	const draftData: DraftData = {
		type,
		timestamp: Date.now(),
		...data,
	};

	try {
		localStorage.setItem(getDraftKey(type), JSON.stringify(draftData));
	} catch (e) {
		// Handle quota exceeded or storage unavailable
		if (e instanceof Error && e.name === "QuotaExceededError") {
			// Try clearing old drafts first
			clearAllDrafts();
			try {
				localStorage.setItem(getDraftKey(type), JSON.stringify(draftData));
			} catch {
				// Still fails, give up silently
			}
		}
	}
}

export function loadDraft(type: PostType): DraftData | null {
	try {
		const key = getDraftKey(type);
		const item = localStorage.getItem(key);
		if (!item) return null;

		const parsed = JSON.parse(item) as DraftData;
		// Validate timestamp exists
		if (typeof parsed.timestamp !== "number") {
			localStorage.removeItem(key);
			return null;
		}
		return parsed;
	} catch {
		// Corrupted data, remove it
		const key = getDraftKey(type);
		localStorage.removeItem(key);
		return null;
	}
}

export function clearDraft(type: PostType): void {
	try {
		localStorage.removeItem(getDraftKey(type));
	} catch {}
}

export function clearAllDrafts(): void {
	try {
		const keys = Object.keys(localStorage);
		keys.forEach((key) => {
			if (key.startsWith(DRAFT_KEY_PREFIX)) {
				localStorage.removeItem(key);
			}
		});
	} catch {}
}

export function hasDraft(type: PostType): boolean {
	return loadDraft(type) !== null;
}

export function formatDraftAge(timestamp: number): string {
	const seconds = Math.floor((Date.now() - timestamp) / 1000);
	if (seconds < 60) return `${seconds}秒前`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`;
	return `${Math.floor(seconds / 86400)}天前`;
}

export function getPostTypeLabel(type: PostType): string {
	switch (type) {
		case "MOMENT":
			return "动态";
		case "SNIPPET":
			return "代码";
		case "ARTICLE":
			return "文章";
	}
}
