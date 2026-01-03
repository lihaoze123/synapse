import { describe, expect, it } from "vitest";
import {
	clearAllDrafts,
	clearDraft,
	formatDraftAge,
	getPostTypeLabel,
	hasDraft,
	loadDraft,
	saveDraft,
} from "./draftStorage";

describe("draftStorage", () => {
	describe("saveDraft and loadDraft", () => {
		it("should save and load draft data", () => {
			const draftData = {
				tags: [],
				attachments: [],
				isPrivate: false,
				password: "",
				momentContent: "test content",
			};

			saveDraft("MOMENT", draftData);
			const loaded = loadDraft("MOMENT");

			expect(loaded).toEqual({
				type: "MOMENT",
				timestamp: expect.any(Number),
				tags: [],
				attachments: [],
				isPrivate: false,
				password: "",
				momentContent: "test content",
			});
		});

		it("should save snippet draft with correct fields", () => {
			const draftData = {
				tags: ["javascript"],
				attachments: [],
				isPrivate: false,
				password: "",
				snippetTitle: "Test Snippet",
				snippetCode: 'console.log("test")',
				snippetLanguage: "javascript",
			};

			saveDraft("SNIPPET", draftData);
			const loaded = loadDraft("SNIPPET");

			expect(loaded?.snippetTitle).toBe("Test Snippet");
			expect(loaded?.snippetCode).toBe('console.log("test")');
			expect(loaded?.snippetLanguage).toBe("javascript");
		});

		it("should save article draft with correct fields", () => {
			const draftData = {
				tags: ["react"],
				attachments: [],
				isPrivate: true,
				password: "secret",
				articleTitle: "Test Article",
				articleContent: "# Test\n\nContent here",
				articleCoverImage: "https://example.com/image.jpg",
			};

			saveDraft("ARTICLE", draftData);
			const loaded = loadDraft("ARTICLE");

			expect(loaded?.articleTitle).toBe("Test Article");
			expect(loaded?.articleContent).toBe("# Test\n\nContent here");
			expect(loaded?.articleCoverImage).toBe("https://example.com/image.jpg");
			expect(loaded?.isPrivate).toBe(true);
			expect(loaded?.password).toBe("secret");
		});

		it("should return null for non-existent draft", () => {
			const loaded = loadDraft("MOMENT");
			expect(loaded).toBeNull();
		});

		it("should handle corrupted data", () => {
			localStorage.setItem("synapse_draft_MOMENT", "invalid json");
			const loaded = loadDraft("MOMENT");
			expect(loaded).toBeNull();
		});

		it("should handle data with missing timestamp", () => {
			localStorage.setItem(
				"synapse_draft_MOMENT",
				JSON.stringify({
					type: "MOMENT",
					tags: [],
					attachments: [],
					isPrivate: false,
					password: "",
				}),
			);
			const loaded = loadDraft("MOMENT");
			expect(loaded).toBeNull();
		});
	});

	describe("clearDraft", () => {
		it("should remove specific draft", () => {
			saveDraft("MOMENT", {
				tags: [],
				attachments: [],
				isPrivate: false,
				password: "",
				momentContent: "test",
			});

			expect(hasDraft("MOMENT")).toBe(true);
			clearDraft("MOMENT");
			expect(hasDraft("MOMENT")).toBe(false);
		});

		it("should not affect other drafts", () => {
			saveDraft("MOMENT", {
				tags: [],
				attachments: [],
				isPrivate: false,
				password: "",
				momentContent: "moment",
			});
			saveDraft("SNIPPET", {
				tags: [],
				attachments: [],
				isPrivate: false,
				password: "",
				snippetTitle: "snippet",
				snippetCode: "code",
				snippetLanguage: "js",
			});

			clearDraft("MOMENT");

			expect(hasDraft("MOMENT")).toBe(false);
			expect(hasDraft("SNIPPET")).toBe(true);
		});
	});

	describe("clearAllDrafts", () => {
		it("should remove all drafts", () => {
			saveDraft("MOMENT", {
				tags: [],
				attachments: [],
				isPrivate: false,
				password: "",
				momentContent: "moment",
			});
			saveDraft("SNIPPET", {
				tags: [],
				attachments: [],
				isPrivate: false,
				password: "",
				snippetTitle: "snippet",
				snippetCode: "code",
				snippetLanguage: "js",
			});

			clearAllDrafts();

			expect(hasDraft("MOMENT")).toBe(false);
			expect(hasDraft("SNIPPET")).toBe(false);
		});

		it("should only remove synapse draft keys", () => {
			localStorage.setItem("other_key", "value");
			saveDraft("MOMENT", {
				tags: [],
				attachments: [],
				isPrivate: false,
				password: "",
				momentContent: "test",
			});

			clearAllDrafts();

			expect(localStorage.getItem("other_key")).toBe("value");
			expect(hasDraft("MOMENT")).toBe(false);
		});
	});

	describe("hasDraft", () => {
		it("should return true when draft exists", () => {
			saveDraft("MOMENT", {
				tags: [],
				attachments: [],
				isPrivate: false,
				password: "",
				momentContent: "test",
			});
			expect(hasDraft("MOMENT")).toBe(true);
		});

		it("should return false when draft does not exist", () => {
			expect(hasDraft("MOMENT")).toBe(false);
		});
	});

	describe("formatDraftAge", () => {
		it("should format seconds correctly", () => {
			const now = Date.now();
			expect(formatDraftAge(now - 30 * 1000)).toBe("30秒前");
			expect(formatDraftAge(now - 59 * 1000)).toBe("59秒前");
		});

		it("should format minutes correctly", () => {
			const now = Date.now();
			expect(formatDraftAge(now - 60 * 1000)).toBe("1分钟前");
			expect(formatDraftAge(now - 30 * 60 * 1000)).toBe("30分钟前");
			expect(formatDraftAge(now - 59 * 60 * 1000)).toBe("59分钟前");
		});

		it("should format hours correctly", () => {
			const now = Date.now();
			expect(formatDraftAge(now - 60 * 60 * 1000)).toBe("1小时前");
			expect(formatDraftAge(now - 5 * 60 * 60 * 1000)).toBe("5小时前");
			expect(formatDraftAge(now - 23 * 60 * 60 * 1000)).toBe("23小时前");
		});

		it("should format days correctly", () => {
			const now = Date.now();
			expect(formatDraftAge(now - 24 * 60 * 60 * 1000)).toBe("1天前");
			expect(formatDraftAge(now - 3 * 24 * 60 * 60 * 1000)).toBe("3天前");
		});
	});

	describe("getPostTypeLabel", () => {
		it("should return correct labels", () => {
			expect(getPostTypeLabel("MOMENT")).toBe("动态");
			expect(getPostTypeLabel("SNIPPET")).toBe("代码");
			expect(getPostTypeLabel("ARTICLE")).toBe("文章");
		});
	});
});
