import type { StreamChunk } from "@tanstack/ai";
import type { UIMessage } from "@tanstack/ai-client";
import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { useCallback } from "react";

interface UseAIOptions {
	endpoint?: string;
	// Optional: explicitly pass a token; if omitted we'll read from localStorage
	token?: string | null;
	onFinish?: (message: UIMessage) => void;
	onChunk?: (chunk: StreamChunk) => void;
	onError?: (error: Error) => void;
}

export function useAI(options: UseAIOptions = {}) {
	const { endpoint = "/api/ai/chat" } = options;
	const token =
		options.token ??
		(typeof window !== "undefined" ? localStorage.getItem("token") : null);

	const { messages, sendMessage, isLoading, error, stop, reload } = useChat({
		// Include auth header for protected /api/** endpoints and same-origin credentials for cookies if any.
		connection: fetchServerSentEvents(endpoint, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			credentials: "same-origin",
		}),
		onFinish: options.onFinish,
		onChunk: options.onChunk,
		onError: options.onError,
	});

	const improveWriting = useCallback(
		(text: string) => {
			sendMessage(
				`请改进以下文本，使其更清晰、更吸引人，同时保留原意：\n\n${text}`,
			);
		},
		[sendMessage],
	);

	const summarize = useCallback(
		(content: string) => {
			sendMessage(`请为以下内容提供简洁的摘要：\n\n${content}`);
		},
		[sendMessage],
	);

	const explainCode = useCallback(
		(code: string, language: string) => {
			sendMessage(
				`请用通俗易懂的语言解释以下 ${language} 代码：\n\n\`\`\`${language}\n${code}\n\`\`\``,
			);
		},
		[sendMessage],
	);

	return {
		messages,
		sendMessage,
		isLoading,
		error,
		stop,
		reload,
		improveWriting,
		summarize,
		explainCode,
	};
}
