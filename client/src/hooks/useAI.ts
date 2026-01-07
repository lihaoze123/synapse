import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import { useCallback } from "react";

interface UseAIOptions {
	endpoint?: string;
}

export function useAI(options: UseAIOptions = {}) {
	const { endpoint = "/api/ai/chat" } = options;

	const { messages, sendMessage, isLoading, error, stop, reload } = useChat({
		connection: fetchServerSentEvents(endpoint),
	});

	const improveWriting = useCallback(
		(text: string) => {
			sendMessage(
				`Please improve the following text, making it clearer and more engaging while preserving the original meaning:\n\n${text}`,
			);
		},
		[sendMessage],
	);

	const summarize = useCallback(
		(content: string) => {
			sendMessage(
				`Please provide a concise summary of the following content:\n\n${content}`,
			);
		},
		[sendMessage],
	);

	const explainCode = useCallback(
		(code: string, language: string) => {
			sendMessage(
				`Please explain the following ${language} code in simple terms:\n\n\`\`\`${language}\n${code}\n\`\`\``,
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
