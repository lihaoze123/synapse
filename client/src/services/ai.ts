export type AIAction = "improve" | "summarize" | "explain";

export interface AIConfig {
	endpoint: string;
}

const PROMPTS: Record<
	AIAction,
	(content: string, language?: string) => string
> = {
	improve: (content) =>
		`请改进以下文本，使其更清晰、更吸引人，同时保留原意：\n\n${content}`,
	summarize: (content) =>
		`请为以下内容提供简洁的摘要：\n\n${content}`,
	explain: (content, language = "code") =>
		`请用通俗易懂的语言解释以下 ${language} 代码：\n\n\`\`\`${language}\n${content}\n\`\`\``,
};

export const aiService = {
	getConfig(): AIConfig {
		return {
			endpoint: "/api/ai/chat",
		};
	},

	buildPrompt(action: AIAction, content: string, language?: string): string {
		const promptBuilder = PROMPTS[action];
		if (!promptBuilder) {
			return content;
		}
		return promptBuilder(content, language);
	},

	isConfigured(): boolean {
		return true;
	},
};
