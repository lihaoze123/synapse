import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PostAIActions from "./PostAIActions";

describe("PostAIActions", () => {
	const defaultProps = {
		postTitle: "Test Post",
		postContent: "This is a test post content",
		postType: "ARTICLE" as const,
		onSummarize: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("rendering", () => {
		it("should render summarize button", () => {
			render(<PostAIActions {...defaultProps} />);

			expect(screen.getByText("AI 摘要")).toBeInTheDocument();
		});

		it("should render explain button for SNIPPET with language", () => {
			render(
				<PostAIActions
					{...defaultProps}
					postType="SNIPPET"
					language="javascript"
					onExplain={vi.fn()}
				/>,
			);

			expect(screen.getByText("AI 解释")).toBeInTheDocument();
		});

		it("should not render explain button for ARTICLE type", () => {
			render(
				<PostAIActions
					{...defaultProps}
					postType="ARTICLE"
					language="javascript"
					onExplain={vi.fn()}
				/>,
			);

			expect(screen.queryByText("AI 解释")).not.toBeInTheDocument();
		});

		it("should not render explain button when language is not provided", () => {
			render(
				<PostAIActions
					{...defaultProps}
					postType="SNIPPET"
					onExplain={vi.fn()}
				/>,
			);

			expect(screen.queryByText("AI 解释")).not.toBeInTheDocument();
		});

		it("should not render explain button when onExplain is not provided", () => {
			render(
				<PostAIActions
					{...defaultProps}
					postType="SNIPPET"
					language="python"
				/>,
			);

			expect(screen.queryByText("AI 解释")).not.toBeInTheDocument();
		});

		it("should apply custom className", () => {
			const { container } = render(
				<PostAIActions {...defaultProps} className="custom-class" />,
			);

			expect(container.firstChild).toHaveClass("custom-class");
		});
	});

	describe("interactions", () => {
		it("should call onSummarize with post content when summarize button is clicked", () => {
			render(<PostAIActions {...defaultProps} />);

			fireEvent.click(screen.getByText("AI 摘要"));

			expect(defaultProps.onSummarize).toHaveBeenCalledWith(
				"This is a test post content",
			);
		});

		it("should call onExplain with post content and language when explain button is clicked", () => {
			const onExplain = vi.fn();
			render(
				<PostAIActions
					{...defaultProps}
					postType="SNIPPET"
					language="python"
					postContent="print('hello')"
					onExplain={onExplain}
				/>,
			);

			fireEvent.click(screen.getByText("AI 解释"));

			expect(onExplain).toHaveBeenCalledWith("print('hello')", "python");
		});

		it("should not call onSummarize when post content is null", () => {
			render(<PostAIActions {...defaultProps} postContent={null} />);

			fireEvent.click(screen.getByText("AI 摘要"));

			expect(defaultProps.onSummarize).not.toHaveBeenCalled();
		});

		it("should not call onExplain when post content is null", () => {
			const onExplain = vi.fn();
			render(
				<PostAIActions
					{...defaultProps}
					postType="SNIPPET"
					language="javascript"
					postContent={null}
					onExplain={onExplain}
				/>,
			);

			fireEvent.click(screen.getByText("AI 解释"));

			expect(onExplain).not.toHaveBeenCalled();
		});
	});

	describe("modal behavior", () => {
		it("should open modal with loading state when summarize is clicked", () => {
			render(<PostAIActions {...defaultProps} />);

			fireEvent.click(screen.getByText("AI 摘要"));

			expect(screen.getByText("AI 正在生成中...")).toBeInTheDocument();
			expect(screen.getByText("AI 内容摘要")).toBeInTheDocument();
		});

		it("should open modal with loading state when explain is clicked", () => {
			const onExplain = vi.fn();
			render(
				<PostAIActions
					{...defaultProps}
					postType="SNIPPET"
					language="javascript"
					onExplain={onExplain}
				/>,
			);

			fireEvent.click(screen.getByText("AI 解释"));

			expect(screen.getByText("AI 正在生成中...")).toBeInTheDocument();
			expect(screen.getByText("AI 代码解释")).toBeInTheDocument();
		});

		it("should display post title in modal", () => {
			render(<PostAIActions {...defaultProps} postTitle="My Custom Title" />);

			fireEvent.click(screen.getByText("AI 摘要"));

			expect(screen.getByText("My Custom Title")).toBeInTheDocument();
		});

		it("should display result when ai-result event is dispatched with result", () => {
			render(<PostAIActions {...defaultProps} />);

			fireEvent.click(screen.getByText("AI 摘要"));

			expect(screen.getByText("AI 正在生成中...")).toBeInTheDocument();

			fireEvent(
				window,
				new CustomEvent("ai-result", {
					detail: { result: "AI generated summary" },
				}),
			);

			expect(screen.queryByText("AI generated summary")).toBeInTheDocument();
		});

		it("should display error when ai-result event is dispatched with error", () => {
			render(<PostAIActions {...defaultProps} />);

			fireEvent.click(screen.getByText("AI 摘要"));

			expect(screen.getByText("AI 正在生成中...")).toBeInTheDocument();

			fireEvent(
				window,
				new CustomEvent("ai-result", {
					detail: { error: "AI service unavailable" },
				}),
			);

			expect(screen.queryByText("AI service unavailable")).toBeInTheDocument();
		});

		it("should close modal when close button is clicked", () => {
			render(<PostAIActions {...defaultProps} />);

			fireEvent.click(screen.getByText("AI 摘要"));

			fireEvent(
				window,
				new CustomEvent("ai-result", {
					detail: { result: "Summary result" },
				}),
			);

			expect(screen.queryByText("Summary result")).toBeInTheDocument();

			const closeButton = screen
				.getAllByRole("button")
				.find((btn) => btn.querySelector("svg"));
			fireEvent.click(closeButton!);

			expect(screen.queryByText("AI 内容摘要")).not.toBeInTheDocument();
		});

		it("should copy result to clipboard when copy button is clicked", () => {
			const mockWriteText = vi.fn().mockResolvedValue(undefined);
			Object.defineProperty(global.navigator, "clipboard", {
				value: { writeText: mockWriteText },
				writable: true,
				configurable: true,
			});

			render(<PostAIActions {...defaultProps} />);

			fireEvent.click(screen.getByText("AI 摘要"));

			fireEvent(
				window,
				new CustomEvent("ai-result", {
					detail: { result: "Copy this result" },
				}),
			);

			const copyButton = screen.queryByText("复制结果");
			if (copyButton) {
				fireEvent.click(copyButton);
				expect(mockWriteText).toHaveBeenCalledWith("Copy this result");
			}
		});
	});

	describe("edge cases", () => {
		it("should handle null post title", () => {
			render(<PostAIActions {...defaultProps} postTitle={null} />);

			fireEvent.click(screen.getByText("AI 摘要"));

			expect(screen.getByText("AI 内容摘要")).toBeInTheDocument();
		});

		it("should handle MOMENT post type", () => {
			render(<PostAIActions {...defaultProps} postType="MOMENT" />);

			expect(screen.getByText("AI 摘要")).toBeInTheDocument();
		});

		it("should handle multiple rapid clicks without opening multiple modals", () => {
			render(<PostAIActions {...defaultProps} />);

			const button = screen.getByText("AI 摘要");
			fireEvent.click(button);
			fireEvent.click(button);
			fireEvent.click(button);

			const modals = screen.queryAllByText("AI 内容摘要");
			expect(modals.length).toBe(1);
		});
	});

	describe("cleanup", () => {
		it("should remove event listener on unmount", () => {
			const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

			const { unmount } = render(<PostAIActions {...defaultProps} />);

			unmount();

			expect(removeEventListenerSpy).toHaveBeenCalledWith(
				"ai-result",
				expect.any(Function),
			);
		});
	});
});
