import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("animations", () => {
	describe("AnimatedPage", () => {
		it("should render children with fade transition by default", async () => {
			const { AnimatedPage } = await import("./animations");
			render(
				<AnimatedPage>
					<div data-testid="content">Hello</div>
				</AnimatedPage>,
			);

			expect(screen.getByTestId("content")).toBeInTheDocument();
			expect(screen.getByText("Hello")).toBeInTheDocument();
		});

		it("should render with slideRight transition", async () => {
			const { AnimatedPage } = await import("./animations");
			render(
				<AnimatedPage transition="slideRight">
					<div data-testid="content">Slide Content</div>
				</AnimatedPage>,
			);

			expect(screen.getByTestId("content")).toBeInTheDocument();
		});

		it("should render with scale transition", async () => {
			const { AnimatedPage } = await import("./animations");
			render(
				<AnimatedPage transition="scale">
					<div data-testid="content">Scale Content</div>
				</AnimatedPage>,
			);

			expect(screen.getByTestId("content")).toBeInTheDocument();
		});

		it("should render with slideUp transition", async () => {
			const { AnimatedPage } = await import("./animations");
			render(
				<AnimatedPage transition="slideUp">
					<div data-testid="content">SlideUp Content</div>
				</AnimatedPage>,
			);

			expect(screen.getByTestId("content")).toBeInTheDocument();
		});

		it("should accept className prop", async () => {
			const { AnimatedPage } = await import("./animations");
			render(
				<AnimatedPage className="custom-class">
					<div>Content</div>
				</AnimatedPage>,
			);

			const container = screen.getByText("Content").parentElement;
			expect(container).toHaveClass("custom-class");
		});
	});

	describe("StaggerContainer", () => {
		it("should render children in a stagger container", async () => {
			const { StaggerContainer, StaggerItem } = await import("./animations");
			render(
				<StaggerContainer>
					<StaggerItem>
						<div data-testid="item1">Item 1</div>
					</StaggerItem>
					<StaggerItem>
						<div data-testid="item2">Item 2</div>
					</StaggerItem>
				</StaggerContainer>,
			);

			expect(screen.getByTestId("item1")).toBeInTheDocument();
			expect(screen.getByTestId("item2")).toBeInTheDocument();
		});

		it("should accept className prop", async () => {
			const { StaggerContainer } = await import("./animations");
			render(
				<StaggerContainer className="stagger-class">
					<div>Content</div>
				</StaggerContainer>,
			);

			const container = screen.getByText("Content").parentElement;
			expect(container).toHaveClass("stagger-class");
		});

		it("should accept custom stagger delay", async () => {
			const { StaggerContainer, StaggerItem } = await import("./animations");
			render(
				<StaggerContainer staggerDelay={0.1}>
					<StaggerItem>
						<div>Item</div>
					</StaggerItem>
				</StaggerContainer>,
			);

			expect(screen.getByText("Item")).toBeInTheDocument();
		});
	});

	describe("StaggerItem", () => {
		it("should render children", async () => {
			const { StaggerItem } = await import("./animations");
			render(
				<StaggerItem>
					<div data-testid="stagger-child">Child</div>
				</StaggerItem>,
			);

			expect(screen.getByTestId("stagger-child")).toBeInTheDocument();
		});

		it("should accept className prop", async () => {
			const { StaggerItem } = await import("./animations");
			render(
				<StaggerItem className="item-class">
					<div>Content</div>
				</StaggerItem>,
			);

			const container = screen.getByText("Content").parentElement;
			expect(container).toHaveClass("item-class");
		});
	});

	describe("SlideIn", () => {
		it("should render children with slide animation", async () => {
			const { SlideIn } = await import("./animations");
			render(
				<SlideIn>
					<div data-testid="slide-content">Slide</div>
				</SlideIn>,
			);

			expect(screen.getByTestId("slide-content")).toBeInTheDocument();
		});

		it("should render with left direction", async () => {
			const { SlideIn } = await import("./animations");
			render(
				<SlideIn direction="left">
					<div>Left slide</div>
				</SlideIn>,
			);

			expect(screen.getByText("Left slide")).toBeInTheDocument();
		});

		it("should render with right direction", async () => {
			const { SlideIn } = await import("./animations");
			render(
				<SlideIn direction="right">
					<div>Right slide</div>
				</SlideIn>,
			);

			expect(screen.getByText("Right slide")).toBeInTheDocument();
		});

		it("should render with up direction", async () => {
			const { SlideIn } = await import("./animations");
			render(
				<SlideIn direction="up">
					<div>Up slide</div>
				</SlideIn>,
			);

			expect(screen.getByText("Up slide")).toBeInTheDocument();
		});

		it("should render with down direction", async () => {
			const { SlideIn } = await import("./animations");
			render(
				<SlideIn direction="down">
					<div>Down slide</div>
				</SlideIn>,
			);

			expect(screen.getByText("Down slide")).toBeInTheDocument();
		});

		it("should accept delay prop", async () => {
			const { SlideIn } = await import("./animations");
			render(
				<SlideIn delay={0.5}>
					<div>Delayed</div>
				</SlideIn>,
			);

			expect(screen.getByText("Delayed")).toBeInTheDocument();
		});
	});

	describe("FadeIn", () => {
		it("should render children with fade animation", async () => {
			const { FadeIn } = await import("./animations");
			render(
				<FadeIn>
					<div data-testid="fade-content">Fade</div>
				</FadeIn>,
			);

			expect(screen.getByTestId("fade-content")).toBeInTheDocument();
		});

		it("should accept delay and duration props", async () => {
			const { FadeIn } = await import("./animations");
			render(
				<FadeIn delay={0.2} duration={0.5}>
					<div>Delayed fade</div>
				</FadeIn>,
			);

			expect(screen.getByText("Delayed fade")).toBeInTheDocument();
		});

		it("should accept className prop", async () => {
			const { FadeIn } = await import("./animations");
			render(
				<FadeIn className="fade-class">
					<div>Content</div>
				</FadeIn>,
			);

			const container = screen.getByText("Content").parentElement;
			expect(container).toHaveClass("fade-class");
		});
	});

	describe("exports", () => {
		it("should export AnimatePresence and motion from framer-motion", async () => {
			const { AnimatePresence, motion } = await import("./animations");

			expect(AnimatePresence).toBeDefined();
			expect(motion).toBeDefined();
		});
	});
});
