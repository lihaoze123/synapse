import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("BlurImage", () => {
	describe("rendering", () => {
		it("should render image with src and alt", async () => {
			const { BlurImage } = await import("./BlurImage");
			render(<BlurImage src="/test.jpg" alt="Test image" />);

			const img = screen.getByRole("img");
			expect(img).toHaveAttribute("src", "/test.jpg");
			expect(img).toHaveAttribute("alt", "Test image");
		});

		it("should have lazy loading by default", async () => {
			const { BlurImage } = await import("./BlurImage");
			render(<BlurImage src="/test.jpg" alt="Test image" />);

			const img = screen.getByRole("img");
			expect(img).toHaveAttribute("loading", "lazy");
		});

		it("should apply className to image", async () => {
			const { BlurImage } = await import("./BlurImage");
			render(
				<BlurImage src="/test.jpg" alt="Test image" className="custom-img" />,
			);

			const img = screen.getByRole("img");
			expect(img).toHaveClass("custom-img");
		});

		it("should apply containerClassName to container", async () => {
			const { BlurImage } = await import("./BlurImage");
			const { container } = render(
				<BlurImage
					src="/test.jpg"
					alt="Test image"
					containerClassName="custom-container"
				/>,
			);

			const containerDiv = container.firstChild;
			expect(containerDiv).toHaveClass("custom-container");
		});

		it("should apply aspectRatio style when provided", async () => {
			const { BlurImage } = await import("./BlurImage");
			const { container } = render(
				<BlurImage src="/test.jpg" alt="Test image" aspectRatio="16/9" />,
			);

			const containerDiv = container.firstChild;
			expect(containerDiv).toHaveStyle({ aspectRatio: "16/9" });
		});
	});

	describe("loading states", () => {
		it("should show placeholder before image loads", async () => {
			const { BlurImage } = await import("./BlurImage");
			const { container } = render(
				<BlurImage src="/test.jpg" alt="Test image" />,
			);

			const placeholder = container.querySelector(".animate-pulse");
			expect(placeholder).toBeInTheDocument();
		});

		it("should handle image load event", async () => {
			const { BlurImage } = await import("./BlurImage");
			render(<BlurImage src="/test.jpg" alt="Test image" />);

			const img = screen.getByRole("img");
			fireEvent.load(img);

			await waitFor(() => {
				expect(img).toBeInTheDocument();
			});
		});
	});

	describe("error handling", () => {
		it("should show error state when image fails to load", async () => {
			const { BlurImage } = await import("./BlurImage");
			render(<BlurImage src="/invalid.jpg" alt="Test image" />);

			const img = screen.getByRole("img");
			fireEvent.error(img);

			await waitFor(() => {
				expect(screen.getByText("加载失败")).toBeInTheDocument();
			});
		});

		it("should apply placeholderColor to error state", async () => {
			const { BlurImage } = await import("./BlurImage");
			const { container } = render(
				<BlurImage
					src="/invalid.jpg"
					alt="Test image"
					placeholderColor="bg-red-200"
				/>,
			);

			const img = screen.getByRole("img");
			fireEvent.error(img);

			await waitFor(() => {
				const errorContainer = container.querySelector(".bg-red-200");
				expect(errorContainer).toBeInTheDocument();
			});
		});
	});

	describe("click handling", () => {
		it("should call onClick when provided", async () => {
			const handleClick = vi.fn();
			const { BlurImage } = await import("./BlurImage");
			render(
				<BlurImage src="/test.jpg" alt="Test image" onClick={handleClick} />,
			);

			const button = screen.getByRole("button");
			fireEvent.click(button);

			expect(handleClick).toHaveBeenCalledTimes(1);
		});

		it("should render as button when onClick is provided", async () => {
			const handleClick = vi.fn();
			const { BlurImage } = await import("./BlurImage");
			render(
				<BlurImage src="/test.jpg" alt="Test image" onClick={handleClick} />,
			);

			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
			expect(button.tagName).toBe("BUTTON");
		});

		it("should have aria-label when onClick is provided", async () => {
			const handleClick = vi.fn();
			const { BlurImage } = await import("./BlurImage");
			render(
				<BlurImage src="/test.jpg" alt="Test image" onClick={handleClick} />,
			);

			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("aria-label", "Test image");
		});

		it("should render as div when onClick is not provided", async () => {
			const { BlurImage } = await import("./BlurImage");
			const { container } = render(
				<BlurImage src="/test.jpg" alt="Test image" />,
			);

			const containerDiv = container.firstChild as HTMLElement;
			expect(containerDiv.tagName).toBe("DIV");
		});
	});
});
