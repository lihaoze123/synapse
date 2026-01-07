export type AIAction = "improve" | "summarize" | "explain";

export interface AIConfig {
	endpoint: string;
}

const PROMPTS: Record<
	AIAction,
	(content: string, language?: string) => string
> = {
	improve: (content) =>
		`Please improve the following text, making it clearer and more engaging while preserving the original meaning:\n\n${content}`,
	summarize: (content) =>
		`Please provide a concise summary of the following content:\n\n${content}`,
	explain: (content, language = "code") =>
		`Please explain the following ${language} code in simple terms:\n\n\`\`\`${language}\n${content}\n\`\`\``,
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
