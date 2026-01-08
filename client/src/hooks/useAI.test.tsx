import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAI } from "./useAI";

vi.mock("@tanstack/ai-react", () => ({
	useChat: vi.fn(),
	fetchServerSentEvents: vi.fn((url: string) => url),
}));

const mockUseChat = vi.mocked(
	(await import("@tanstack/ai-react")).useChat,
	true,
);

describe("useAI hook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const createMockChatReturn = (overrides = {}) =>
		({
			messages: [],
			sendMessage: vi.fn(),
			isLoading: false,
			error: undefined,
			stop: vi.fn(),
			reload: vi.fn(),
			append: vi.fn(),
			addToolResult: vi.fn(),
			addToolApprovalResponse: vi.fn(),
			setMessages: vi.fn(),
			clear: vi.fn(),
			...overrides,
		}) as any;

	describe("useAI", () => {
		it("should initialize with empty messages", () => {
			mockUseChat.mockReturnValue(createMockChatReturn());

			const { result } = renderHook(() => useAI());

			expect(result.current.messages).toEqual([]);
			expect(result.current.isLoading).toBe(false);
			expect(result.current.error).toBeUndefined();
		});

		it("should send message and update loading state", async () => {
			const mockSendMessage = vi.fn();
			mockUseChat.mockReturnValue(
				createMockChatReturn({ sendMessage: mockSendMessage }),
			);

			const { result } = renderHook(() => useAI());

			act(() => {
				result.current.sendMessage("Hello AI");
			});

			expect(mockSendMessage).toHaveBeenCalledWith("Hello AI");
		});

		it("should handle error state", () => {
			const testError = new Error("AI request failed");
			mockUseChat.mockReturnValue(createMockChatReturn({ error: testError }));

			const { result } = renderHook(() => useAI());

			expect(result.current.error).toBe(testError);
		});

		it("should provide stop function", () => {
			const mockStop = vi.fn();
			mockUseChat.mockReturnValue(
				createMockChatReturn({ stop: mockStop, isLoading: true }),
			);

			const { result } = renderHook(() => useAI());

			act(() => {
				result.current.stop();
			});

			expect(mockStop).toHaveBeenCalled();
		});

		it("should use custom endpoint when provided", () => {
			mockUseChat.mockReturnValue(createMockChatReturn());

			renderHook(() => useAI({ endpoint: "/api/custom-ai" }));

			expect(mockUseChat).toHaveBeenCalledWith(
				expect.objectContaining({
					connection: "/api/custom-ai",
				}),
			);
		});

		it("should use default endpoint /api/ai/chat", () => {
			mockUseChat.mockReturnValue(createMockChatReturn());

			renderHook(() => useAI());

			expect(mockUseChat).toHaveBeenCalledWith(
				expect.objectContaining({
					connection: "/api/ai/chat",
				}),
			);
		});
	});

	describe("AI helper functions", () => {
		it("should provide improveWriting helper", async () => {
			const mockSendMessage = vi.fn();
			mockUseChat.mockReturnValue(
				createMockChatReturn({ sendMessage: mockSendMessage }),
			);

			const { result } = renderHook(() => useAI());

			act(() => {
				result.current.improveWriting("some text");
			});

			expect(mockSendMessage).toHaveBeenCalledWith(
				expect.stringContaining("some text"),
			);
		});

		it("should provide summarize helper", async () => {
			const mockSendMessage = vi.fn();
			mockUseChat.mockReturnValue(
				createMockChatReturn({ sendMessage: mockSendMessage }),
			);

			const { result } = renderHook(() => useAI());

			act(() => {
				result.current.summarize("long content here");
			});

			expect(mockSendMessage).toHaveBeenCalledWith(
				expect.stringContaining("long content here"),
			);
		});

		it("should provide explainCode helper", async () => {
			const mockSendMessage = vi.fn();
			mockUseChat.mockReturnValue(
				createMockChatReturn({ sendMessage: mockSendMessage }),
			);

			const { result } = renderHook(() => useAI());

			act(() => {
				result.current.explainCode("const x = 1;", "javascript");
			});

			expect(mockSendMessage).toHaveBeenCalledWith(
				expect.stringContaining("const x = 1;"),
			);
			expect(mockSendMessage).toHaveBeenCalledWith(
				expect.stringContaining("javascript"),
			);
		});
	});
});
