import { beforeEach, describe, expect, it, vi } from "vitest";
import { aiService } from "./ai";

vi.mock("./api", () => ({
	default: {
		get: vi.fn(),
	},
}));

describe("aiService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getConfig", () => {
		it("should return AI configuration", () => {
			const config = aiService.getConfig();

			expect(config).toHaveProperty("endpoint");
			expect(config.endpoint).toBe("/api/ai/chat");
		});
	});

	describe("buildPrompt", () => {
		it("should build improve writing prompt", () => {
			const prompt = aiService.buildPrompt("improve", "test text");

			expect(prompt).toContain("test text");
			expect(prompt).toContain("improve");
		});

		it("should build summarize prompt", () => {
			const prompt = aiService.buildPrompt("summarize", "long content");

			expect(prompt).toContain("long content");
			expect(prompt).toContain("summary");
		});

		it("should build explain code prompt with language", () => {
			const prompt = aiService.buildPrompt(
				"explain",
				"const x = 1;",
				"javascript",
			);

			expect(prompt).toContain("const x = 1;");
			expect(prompt).toContain("javascript");
		});

		it("should handle unknown action type", () => {
			const prompt = aiService.buildPrompt(
				"unknown" as "improve",
				"some content",
			);

			expect(prompt).toContain("some content");
		});
	});

	describe("isConfigured", () => {
		it("should return true when endpoint is configured", () => {
			expect(aiService.isConfigured()).toBe(true);
		});
	});
});
