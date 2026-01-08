import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AIAssistantToolbar from "./AIAssistantToolbar";

describe("AIAssistantToolbar", () => {
	const mockTextareaRef = { current: document.createElement("textarea") };
	const defaultProps = {
		textareaRef: mockTextareaRef,
		content: "Some content",
		onAction: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("rendering", () => {
		it("should render AI trigger and show improve/summarize in menu", () => {
			render(<AIAssistantToolbar {...defaultProps} />);

			const trigger = screen.getByTitle("AI 工具");
			expect(trigger).toBeInTheDocument();
			fireEvent.click(trigger);
			expect(screen.getByText("润色")).toBeInTheDocument();
			expect(screen.getByText("总结")).toBeInTheDocument();
		});

		it("should render explain button when language is provided", () => {
			render(<AIAssistantToolbar {...defaultProps} language="javascript" />);

			fireEvent.click(screen.getByTitle("AI 工具"));
			expect(screen.getByText("解释")).toBeInTheDocument();
		});

		it("should not render explain button when language is not provided", () => {
			render(<AIAssistantToolbar {...defaultProps} />);

			fireEvent.click(screen.getByTitle("AI 工具"));
			expect(screen.queryByText("解释")).not.toBeInTheDocument();
		});

		it("should apply custom className", () => {
			const { container } = render(
				<AIAssistantToolbar {...defaultProps} className="custom-class" />,
			);

			expect(container.firstChild).toHaveClass("custom-class");
		});

		it("should disable buttons when disabled prop is true", () => {
			render(<AIAssistantToolbar {...defaultProps} disabled />);

			expect(screen.getByTitle("AI 工具")).toBeDisabled();
		});

		it("should disable buttons when isLoading is true", () => {
			render(<AIAssistantToolbar {...defaultProps} isLoading />);

			expect(screen.getByTitle("AI 工具")).toBeDisabled();
		});
	});

	describe("interactions", () => {
		it("should call onAction with improve action when improve menu item is clicked", () => {
			render(<AIAssistantToolbar {...defaultProps} content="Test content" />);

			fireEvent.click(screen.getByTitle("AI 工具"));
			fireEvent.click(screen.getByText("润色"));

			expect(defaultProps.onAction).toHaveBeenCalledWith(
				"improve",
				"Test content",
				undefined,
			);
		});

		it("should call onAction with summarize action when summarize menu item is clicked", () => {
			render(<AIAssistantToolbar {...defaultProps} content="Test content" />);

			fireEvent.click(screen.getByTitle("AI 工具"));
			fireEvent.click(screen.getByText("总结"));

			expect(defaultProps.onAction).toHaveBeenCalledWith(
				"summarize",
				"Test content",
				undefined,
			);
		});

		it("should call onAction with explain action when explain menu item is clicked", () => {
			render(
				<AIAssistantToolbar
					{...defaultProps}
					language="python"
					content="print('hello')"
				/>,
			);

			fireEvent.click(screen.getByTitle("AI 工具"));
			fireEvent.click(screen.getByText("解释"));

			expect(defaultProps.onAction).toHaveBeenCalledWith(
				"explain",
				"print('hello')",
				"python",
			);
		});

		it("should use selected text when text is selected in textarea", () => {
			const textarea = document.createElement("textarea");
			textarea.value = "Some content with selected part";
			textarea.selectionStart = 5;
			textarea.selectionEnd = 10;
			const ref = { current: textarea };

			render(<AIAssistantToolbar {...defaultProps} textareaRef={ref} />);

			fireEvent.click(screen.getByTitle("AI 工具"));
			fireEvent.click(screen.getByText("润色"));

			expect(defaultProps.onAction).toHaveBeenCalledWith(
				"improve",
				"conte",
				undefined,
			);
		});

		it("should not call onAction when content is empty", () => {
			render(<AIAssistantToolbar {...defaultProps} content="" />);

			fireEvent.click(screen.getByTitle("AI 工具"));
			fireEvent.click(screen.getByText("润色"));

			expect(defaultProps.onAction).not.toHaveBeenCalled();
		});

		it("should not call onAction when content is only whitespace", () => {
			render(<AIAssistantToolbar {...defaultProps} content="   " />);

			fireEvent.click(screen.getByTitle("AI 工具"));
			fireEvent.click(screen.getByText("润色"));

			expect(defaultProps.onAction).not.toHaveBeenCalled();
		});

		it("should not call onAction when trigger is disabled", () => {
			render(<AIAssistantToolbar {...defaultProps} disabled />);

			fireEvent.click(screen.getByTitle("AI 工具"));

			expect(defaultProps.onAction).not.toHaveBeenCalled();
		});

		it("should not call onAction when isLoading is true", () => {
			render(<AIAssistantToolbar {...defaultProps} isLoading />);

			fireEvent.click(screen.getByTitle("AI 工具"));

			expect(defaultProps.onAction).not.toHaveBeenCalled();
		});
	});

	describe("accessibility", () => {
		it("should expose shortcuts in menu items", () => {
			render(<AIAssistantToolbar {...defaultProps} />);

			fireEvent.click(screen.getByTitle("AI 工具"));
			// Presence of labels
			expect(screen.getByText("润色")).toBeInTheDocument();
			expect(screen.getByText("总结")).toBeInTheDocument();
			// Shortcuts appear on the right
			expect(screen.getByText("⌘⇧A")).toBeInTheDocument();
			expect(screen.getByText("⌘⇧S")).toBeInTheDocument();
		});

		it("should show explain item when language provided", () => {
			render(<AIAssistantToolbar {...defaultProps} language="typescript" />);

			fireEvent.click(screen.getByTitle("AI 工具"));
			expect(screen.getByText("解释")).toBeInTheDocument();
		});
	});

	describe("edge cases", () => {
		it("should handle null textareaRef gracefully", () => {
			render(
				<AIAssistantToolbar
					{...defaultProps}
					textareaRef={{ current: null }}
				/>,
			);

			fireEvent.click(screen.getByTitle("AI 工具"));
			fireEvent.click(screen.getByText("润色"));

			expect(defaultProps.onAction).toHaveBeenCalledWith(
				"improve",
				"Some content",
				undefined,
			);
		});

		it("should handle zero-length selection", () => {
			const textarea = document.createElement("textarea");
			textarea.value = "Content";
			textarea.selectionStart = 0;
			textarea.selectionEnd = 0;
			const ref = { current: textarea };

			render(
				<AIAssistantToolbar
					{...defaultProps}
					textareaRef={ref}
					content="Content"
				/>,
			);

			fireEvent.click(screen.getByTitle("AI 工具"));
			fireEvent.click(screen.getByText("润色"));

			expect(defaultProps.onAction).toHaveBeenCalledWith(
				"improve",
				"Content",
				undefined,
			);
		});
	});
});
