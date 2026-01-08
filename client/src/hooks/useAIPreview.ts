import { useCallback, useEffect, useRef, useState } from "react";
import { useAI } from "./useAI";

export type AIAction = "improve" | "summarize" | "explain";

interface AIPreviewState {
	isOpen: boolean;
	action: AIAction;
	originalContent: string;
	suggestion: string;
	isLoading: boolean;
	error: string | null;
}

interface UseAIPreviewReturn {
	preview: AIPreviewState;
	generate: (action: AIAction, content: string, language?: string) => void;
	applySuggestion: (callback: (suggestion: string) => void) => void;
	closePreview: () => void;
	retry: () => void;
}

export function useAIPreview(): UseAIPreviewReturn {
	const [preview, setPreview] = useState<AIPreviewState>({
		isOpen: false,
		action: "improve",
		originalContent: "",
		suggestion: "",
		isLoading: false,
		error: null,
	});

	const {
		messages,
		isLoading: aiLoading,
		error: aiError,
		improveWriting,
		summarize,
		explainCode,
	} = useAI({
		// Mark preview done exactly when stream finishes
		onFinish: () =>
			setPreview((prev) => ({
				...prev,
				isLoading: false,
				error: null,
			})),
		// Defensive: on error, stop loading
		onError: () =>
			setPreview((prev) => ({
				...prev,
				isLoading: false,
			})),
	});

	const lastActionRef = useRef<{
		action: AIAction;
		content: string;
		language?: string;
	}>({
		action: "improve",
		content: "",
	});

	useEffect(() => {
		// Update suggestion incrementally while streaming.
		// We intentionally do NOT gate on !aiLoading here so UI can render partial text.
		if (preview.isOpen && !aiError && messages.length > 0) {
			const lastMessage = messages[messages.length - 1];
			if (lastMessage?.role === "assistant") {
				const textPart = lastMessage.parts.find(
					(part): part is { type: "text"; content: string } =>
						part.type === "text",
				);
				if (textPart?.content) {
					setPreview((prev) => ({
						...prev,
						suggestion: textPart.content,
						// Keep isLoading as-is here; we only flip it off when the stream finishes.
						error: null,
					}));
				}
			}
		}
	}, [messages, aiError, preview.isOpen]);

	// When the stream finishes (aiLoading becomes false), mark the preview as not loading.
	useEffect(() => {
		if (!aiLoading && preview.isOpen && !aiError) {
			setPreview((prev) => ({
				...prev,
				isLoading: false,
				error: null,
			}));
		}
	}, [aiLoading, aiError, preview.isOpen]);

	useEffect(() => {
		if (aiError && preview.isOpen) {
			setPreview((prev) => ({
				...prev,
				isLoading: false,
				error: aiError.message || "生成失败，请重试",
			}));
		}
	}, [aiError, preview.isOpen]);

	const generate = useCallback(
		(action: AIAction, content: string, language?: string) => {
			lastActionRef.current = { action, content, language };

			setPreview({
				isOpen: true,
				action,
				originalContent: content,
				suggestion: "",
				isLoading: true,
				error: null,
			});

			switch (action) {
				case "improve":
					improveWriting(content);
					break;
				case "summarize":
					summarize(content);
					break;
				case "explain":
					explainCode(content, language || "code");
					break;
			}
		},
		[improveWriting, summarize, explainCode],
	);

	const closePreview = useCallback(() => {
		setPreview((prev) => ({ ...prev, isOpen: false }));
	}, []);

	const applySuggestion = useCallback(
		(callback: (suggestion: string) => void) => {
			callback(preview.suggestion);
			closePreview();
		},
		[preview.suggestion, closePreview],
	);

	const retry = useCallback(() => {
		const { action, content, language } = lastActionRef.current;
		generate(action, content, language);
	}, [generate]);

	return {
		preview,
		generate,
		applySuggestion,
		closePreview,
		retry,
	};
}
