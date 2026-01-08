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
		it("should render toolbar with improve and summarize buttons", () => {
			render(<AIAssistantToolbar {...defaultProps} />);

			expect(screen.getByTitle("润色 (⌘⇧A)")).toBeInTheDocument();
			expect(screen.getByTitle("总结 (⌘⇧S)")).toBeInTheDocument();
		});

		it("should render explain button when language is provided", () => {
			render(<AIAssistantToolbar {...defaultProps} language="javascript" />);

			const buttons = screen.getAllByRole("button");
			expect(buttons.length).toBeGreaterThan(2);
			expect(screen.getByText("解释")).toBeInTheDocument();
		});

		it("should not render explain button when language is not provided", () => {
			render(<AIAssistantToolbar {...defaultProps} />);

			expect(screen.queryByTitle(/解释/)).not.toBeInTheDocument();
		});

		it("should apply custom className", () => {
			const { container } = render(
				<AIAssistantToolbar {...defaultProps} className="custom-class" />,
			);

			expect(container.firstChild).toHaveClass("custom-class");
		});

		it("should disable buttons when disabled prop is true", () => {
			render(<AIAssistantToolbar {...defaultProps} disabled />);

			expect(screen.getByTitle("润色 (⌘⇧A)")).toBeDisabled();
			expect(screen.getByTitle("总结 (⌘⇧S)")).toBeDisabled();
		});

		it("should disable buttons when isLoading is true", () => {
			render(<AIAssistantToolbar {...defaultProps} isLoading />);

			expect(screen.getByTitle("润色 (⌘⇧A)")).toBeDisabled();
			expect(screen.getByTitle("总结 (⌘⇧S)")).toBeDisabled();
		});
	});

	describe("interactions", () => {
		it("should call onAction with improve action when improve button is clicked", () => {
			render(<AIAssistantToolbar {...defaultProps} content="Test content" />);

			fireEvent.click(screen.getByTitle("润色 (⌘⇧A)"));

			expect(defaultProps.onAction).toHaveBeenCalledWith(
				"improve",
				"Test content",
				undefined,
			);
		});

		it("should call onAction with summarize action when summarize button is clicked", () => {
			render(<AIAssistantToolbar {...defaultProps} content="Test content" />);

			fireEvent.click(screen.getByTitle("总结 (⌘⇧S)"));

			expect(defaultProps.onAction).toHaveBeenCalledWith(
				"summarize",
				"Test content",
				undefined,
			);
		});

		it("should call onAction with explain action when explain button is clicked", () => {
			render(
				<AIAssistantToolbar
					{...defaultProps}
					language="python"
					content="print('hello')"
				/>,
			);

			const buttons = screen.getAllByRole("button");
			const explainButton = buttons.find((b) =>
				b.textContent?.includes("解释"),
			);
			expect(explainButton).toBeDefined();

			fireEvent.click(explainButton!);

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

			fireEvent.click(screen.getByTitle("润色 (⌘⇧A)"));

			expect(defaultProps.onAction).toHaveBeenCalledWith(
				"improve",
				"conte",
				undefined,
			);
		});

		it("should not call onAction when content is empty", () => {
			render(<AIAssistantToolbar {...defaultProps} content="" />);

			fireEvent.click(screen.getByTitle("润色 (⌘⇧A)"));

			expect(defaultProps.onAction).not.toHaveBeenCalled();
		});

		it("should not call onAction when content is only whitespace", () => {
			render(<AIAssistantToolbar {...defaultProps} content="   " />);

			fireEvent.click(screen.getByTitle("润色 (⌘⇧A)"));

			expect(defaultProps.onAction).not.toHaveBeenCalled();
		});

		it("should not call onAction when button is disabled", () => {
			render(<AIAssistantToolbar {...defaultProps} disabled />);

			fireEvent.click(screen.getByTitle("润色 (⌘⇧A)"));

			expect(defaultProps.onAction).not.toHaveBeenCalled();
		});

		it("should not call onAction when isLoading is true", () => {
			render(<AIAssistantToolbar {...defaultProps} isLoading />);

			fireEvent.click(screen.getByTitle("润色 (⌘⇧A)"));

			expect(defaultProps.onAction).not.toHaveBeenCalled();
		});
	});

	describe("accessibility", () => {
		it("should have proper button titles with shortcuts", () => {
			render(<AIAssistantToolbar {...defaultProps} />);

			expect(screen.getByTitle("润色 (⌘⇧A)")).toBeInTheDocument();
			expect(screen.getByTitle("总结 (⌘⇧S)")).toBeInTheDocument();
		});

		it("should have explain button with language in title", () => {
			render(<AIAssistantToolbar {...defaultProps} language="typescript" />);

			const buttons = screen.getAllByRole("button");
			const explainButton = buttons.find((b) =>
				b.textContent?.includes("解释"),
			);
			expect(explainButton).toBeDefined();
			const title = explainButton?.getAttribute("title") || "";
			expect(title).toContain("解释");
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

			fireEvent.click(screen.getByTitle("润色 (⌘⇧A)"));

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

			const buttons = screen.getAllByRole("button");
			const improveButton = buttons.find((b) =>
				b.textContent?.includes("润色"),
			);
			expect(improveButton).toBeDefined();
			fireEvent.click(improveButton!);

			expect(defaultProps.onAction).toHaveBeenCalledWith(
				"improve",
				"Content",
				undefined,
			);
		});
	});
});
