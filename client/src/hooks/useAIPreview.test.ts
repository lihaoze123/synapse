import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAIPreview } from "./useAIPreview";

vi.mock("@tanstack/ai-react", () => ({
	useChat: vi.fn(),
	fetchServerSentEvents: vi.fn((url: string) => url),
}));

vi.mock("./useAI", () => ({
	useAI: vi.fn(),
}));

const mockUseAI = vi.mocked((await import("./useAI")).useAI, true);

describe("useAIPreview hook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const createMockAIReturn = (overrides = {}) =>
		({
			messages: [],
			sendMessage: vi.fn(),
			isLoading: false,
			error: undefined,
			stop: vi.fn(),
			reload: vi.fn(),
			improveWriting: vi.fn(),
			summarize: vi.fn(),
			explainCode: vi.fn(),
			...overrides,
		}) as any;

	describe("initial state", () => {
		it("should start with closed preview modal", () => {
			mockUseAI.mockReturnValue(createMockAIReturn());

			const { result } = renderHook(() => useAIPreview());

			expect(result.current.preview.isOpen).toBe(false);
			expect(result.current.preview.isLoading).toBe(false);
			expect(result.current.preview.error).toBeNull();
		});
	});

	describe("generate", () => {
		it("should call improveWriting when action is improve", () => {
			const mockImprove = vi.fn();
			mockUseAI.mockReturnValue(
				createMockAIReturn({
					improveWriting: mockImprove,
				}),
			);

			const { result } = renderHook(() => useAIPreview());

			act(() => {
				result.current.generate("improve", "some content");
			});

			expect(mockImprove).toHaveBeenCalledWith("some content");
			expect(result.current.preview.isOpen).toBe(true);
			expect(result.current.preview.isLoading).toBe(true);
			expect(result.current.preview.action).toBe("improve");
			expect(result.current.preview.originalContent).toBe("some content");
		});

		it("should call summarize when action is summarize", () => {
			const mockSummarize = vi.fn();
			mockUseAI.mockReturnValue(
				createMockAIReturn({
					summarize: mockSummarize,
				}),
			);

			const { result } = renderHook(() => useAIPreview());

			act(() => {
				result.current.generate("summarize", "long content");
			});

			expect(mockSummarize).toHaveBeenCalledWith("long content");
			expect(result.current.preview.action).toBe("summarize");
		});

		it("should call explainCode when action is explain", () => {
			const mockExplain = vi.fn();
			mockUseAI.mockReturnValue(
				createMockAIReturn({
					explainCode: mockExplain,
				}),
			);

			const { result } = renderHook(() => useAIPreview());

			act(() => {
				result.current.generate("explain", "code here", "javascript");
			});

			expect(mockExplain).toHaveBeenCalledWith("code here", "javascript");
			expect(result.current.preview.action).toBe("explain");
		});
	});

	describe("applySuggestion", () => {
		it("should call callback with suggestion and close modal", () => {
			mockUseAI.mockReturnValue(
				createMockAIReturn({
					messages: [
						{
							role: "assistant",
							parts: [{ type: "text", content: "AI suggestion" }],
						},
					],
				}),
			);

			const { result } = renderHook(() => useAIPreview());

			act(() => {
				result.current.generate("improve", "original");
			});

			const callback = vi.fn();

			act(() => {
				result.current.applySuggestion(callback);
			});

			expect(callback).toHaveBeenCalledWith("AI suggestion");
			expect(result.current.preview.isOpen).toBe(false);
		});
	});

	describe("closePreview", () => {
		it("should close the preview modal", () => {
			mockUseAI.mockReturnValue(createMockAIReturn());

			const { result } = renderHook(() => useAIPreview());

			act(() => {
				result.current.generate("improve", "content");
			});

			expect(result.current.preview.isOpen).toBe(true);

			act(() => {
				result.current.closePreview();
			});

			expect(result.current.preview.isOpen).toBe(false);
		});
	});

	describe("retry", () => {
		it("should regenerate with last action", () => {
			const mockImprove = vi.fn();
			mockUseAI.mockReturnValue(
				createMockAIReturn({
					improveWriting: mockImprove,
				}),
			);

			const { result } = renderHook(() => useAIPreview());

			act(() => {
				result.current.generate("improve", "content", "python");
			});

			mockImprove.mockClear();

			act(() => {
				result.current.retry();
			});

			expect(mockImprove).toHaveBeenCalledWith("content");
		});
	});

	describe("error handling", () => {
		it("should show error when AI call fails", () => {
			const testError = new Error("AI service unavailable");
			mockUseAI.mockReturnValue(
				createMockAIReturn({
					isLoading: false,
					error: testError,
				}),
			);

			const { result } = renderHook(() => useAIPreview());

			act(() => {
				result.current.generate("improve", "content");
			});

			act(() => {
				// Trigger error effect
			});

			expect(result.current.preview.error).toBe("AI service unavailable");
			expect(result.current.preview.isLoading).toBe(false);
		});
	});
});
