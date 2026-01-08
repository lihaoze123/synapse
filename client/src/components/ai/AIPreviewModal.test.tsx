import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AIPreviewModal from "./AIPreviewModal";

describe("AIPreviewModal", () => {
	const defaultProps = {
		open: true,
		onOpenChange: vi.fn(),
		action: "improve" as const,
		originalContent: "Original text",
		suggestion: "Improved suggestion",
		onApply: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("rendering", () => {
		it("should render modal when open is true", () => {
			render(<AIPreviewModal {...defaultProps} />);

			expect(screen.getByText("AI 润色建议")).toBeInTheDocument();
			expect(screen.getByText("查看 AI 生成的改进版本")).toBeInTheDocument();
		});

		it("should render loading state when isLoading is true", () => {
			render(<AIPreviewModal {...defaultProps} isLoading suggestion="" />);

			expect(screen.getByText("AI 正在思考中...")).toBeInTheDocument();
			expect(screen.getByText(/这可能需要几秒钟/)).toBeInTheDocument();
		});

		it("should render error state when error is provided", () => {
			render(
				<AIPreviewModal
					{...defaultProps}
					suggestion=""
					error="Failed to generate"
				/>,
			);

			expect(screen.getByText("生成失败")).toBeInTheDocument();
			expect(screen.getByText("Failed to generate")).toBeInTheDocument();
		});

		it("should render retry button when error and onRetry are provided", () => {
			const onRetry = vi.fn();
			render(
				<AIPreviewModal
					{...defaultProps}
					suggestion=""
					error="Failed"
					onRetry={onRetry}
				/>,
			);

			expect(screen.getByText("重试")).toBeInTheDocument();
		});

		it("should not render retry button when onRetry is not provided", () => {
			render(<AIPreviewModal {...defaultProps} suggestion="" error="Failed" />);

			expect(screen.queryByText("重试")).not.toBeInTheDocument();
		});

		it("should render original content section", () => {
			render(<AIPreviewModal {...defaultProps} />);

			expect(screen.getByText("原始内容")).toBeInTheDocument();
			expect(screen.getByText("Original text")).toBeInTheDocument();
		});

		it("should render suggestion section with content", () => {
			render(<AIPreviewModal {...defaultProps} />);

			expect(screen.getByText("AI 建议")).toBeInTheDocument();
			expect(screen.getByText("Improved suggestion")).toBeInTheDocument();
		});

		it("should render correct title for summarize action", () => {
			render(<AIPreviewModal {...defaultProps} action="summarize" />);

			expect(screen.getByText("AI 内容摘要")).toBeInTheDocument();
			expect(screen.getByText("查看 AI 生成的内容摘要")).toBeInTheDocument();
		});

		it("should render correct title for explain action", () => {
			render(<AIPreviewModal {...defaultProps} action="explain" />);

			expect(screen.getByText("AI 代码解释")).toBeInTheDocument();
			expect(screen.getByText("查看 AI 生成的代码解释")).toBeInTheDocument();
		});
	});

	describe("interactions", () => {
		it("should call onOpenChange when close button is clicked", () => {
			render(<AIPreviewModal {...defaultProps} />);

			const buttons = screen.getAllByRole("button");
			const closeButton = buttons.find((btn) => btn.querySelector("svg"));
			expect(closeButton).toBeDefined();
			fireEvent.click(closeButton!);

			expect(defaultProps.onOpenChange).toHaveBeenCalledWith(
				false,
				expect.any(Object),
			);
		});

		it("should call onApply and close modal when apply button is clicked", () => {
			render(<AIPreviewModal {...defaultProps} />);

			fireEvent.click(screen.getByText("应用"));

			expect(defaultProps.onApply).toHaveBeenCalled();
			expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
		});

		it("should close modal when cancel button is clicked", () => {
			render(<AIPreviewModal {...defaultProps} />);

			fireEvent.click(screen.getByText("取消"));

			expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
		});

		it("should copy suggestion to clipboard when copy button is clicked", () => {
			const mockWriteText = vi.fn().mockResolvedValue(undefined);
			Object.defineProperty(global.navigator, "clipboard", {
				value: { writeText: mockWriteText },
				writable: true,
				configurable: true,
			});

			render(<AIPreviewModal {...defaultProps} />);

			fireEvent.click(screen.getByText("复制"));

			expect(mockWriteText).toHaveBeenCalledWith("Improved suggestion");
		});

		it("should show copied state after copying", () => {
			const mockWriteText = vi.fn().mockResolvedValue(undefined);
			Object.defineProperty(global.navigator, "clipboard", {
				value: { writeText: mockWriteText },
				writable: true,
				configurable: true,
			});

			render(<AIPreviewModal {...defaultProps} />);

			fireEvent.click(screen.getByText("复制"));

			expect(mockWriteText).toHaveBeenCalledWith("Improved suggestion");
		});

		it("should reset copied state when modal reopens", () => {
			const mockWriteText = vi.fn().mockResolvedValue(undefined);
			Object.defineProperty(global.navigator, "clipboard", {
				value: { writeText: mockWriteText },
				writable: true,
				configurable: true,
			});

			const { rerender } = render(
				<AIPreviewModal {...defaultProps} open={true} />,
			);

			fireEvent.click(screen.getByText("复制"));

			rerender(<AIPreviewModal {...defaultProps} open={false} />);
			rerender(<AIPreviewModal {...defaultProps} open={true} />);

			expect(screen.queryByText("已复制")).not.toBeInTheDocument();
		});

		it("should call onRetry when retry button is clicked", () => {
			const onRetry = vi.fn();
			render(
				<AIPreviewModal
					{...defaultProps}
					suggestion=""
					error="Failed"
					onRetry={onRetry}
				/>,
			);

			fireEvent.click(screen.getByText("重试"));

			expect(onRetry).toHaveBeenCalled();
		});
	});

	describe("conditional rendering", () => {
		it("should not render action buttons when loading", () => {
			render(<AIPreviewModal {...defaultProps} isLoading suggestion="" />);

			expect(screen.queryByText("应用")).not.toBeInTheDocument();
			expect(screen.queryByText("取消")).not.toBeInTheDocument();
		});

		it("should not render action buttons when error", () => {
			render(<AIPreviewModal {...defaultProps} suggestion="" error="Failed" />);

			expect(screen.queryByText("应用")).not.toBeInTheDocument();
			expect(screen.queryByText("取消")).not.toBeInTheDocument();
		});

		it("should render action buttons when suggestion exists", () => {
			render(<AIPreviewModal {...defaultProps} />);

			expect(screen.getByText("应用")).toBeInTheDocument();
			expect(screen.getByText("取消")).toBeInTheDocument();
		});

		it("should not render copy button when loading", () => {
			render(<AIPreviewModal {...defaultProps} isLoading suggestion="" />);

			expect(screen.queryByText("复制")).not.toBeInTheDocument();
		});

		it("should not render copy button when error", () => {
			render(<AIPreviewModal {...defaultProps} suggestion="" error="Failed" />);

			expect(screen.queryByText("复制")).not.toBeInTheDocument();
		});
	});

	describe("accessibility", () => {
		it("should have proper heading for improve action", () => {
			render(<AIPreviewModal {...defaultProps} action="improve" />);

			expect(
				screen.getByRole("heading", { name: "AI 润色建议" }),
			).toBeInTheDocument();
		});

		it("should have proper heading for summarize action", () => {
			render(<AIPreviewModal {...defaultProps} action="summarize" />);

			expect(
				screen.getByRole("heading", { name: "AI 内容摘要" }),
			).toBeInTheDocument();
		});

		it("should have proper heading for explain action", () => {
			render(<AIPreviewModal {...defaultProps} action="explain" />);

			expect(
				screen.getByRole("heading", { name: "AI 代码解释" }),
			).toBeInTheDocument();
		});
	});

	describe("edge cases", () => {
		it("should handle empty original content", () => {
			render(<AIPreviewModal {...defaultProps} originalContent="" />);

			expect(screen.getByText("原始内容")).toBeInTheDocument();
		});

		it("should handle empty suggestion", () => {
			render(<AIPreviewModal {...defaultProps} suggestion="" />);

			expect(screen.getByText("AI 建议")).toBeInTheDocument();
		});

		it("should not render copy button when suggestion is empty", () => {
			render(
				<AIPreviewModal {...defaultProps} suggestion="" isLoading={false} />,
			);

			const copyButton = screen.queryByText("复制");
			expect(copyButton).not.toBeInTheDocument();
		});
	});
});
