import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardPanel,
	CardTitle,
} from "./card";

describe("Card Components", () => {
	describe("Card", () => {
		it("should render card container", () => {
			const { container } = render(<Card>Card content</Card>);
			expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
		});

		it("should apply custom className", () => {
			const { container } = render(
				<Card className="custom-class">Content</Card>,
			);
			expect(container.querySelector(".custom-class")).toBeInTheDocument();
		});

		it("should have data-slot attribute", () => {
			const { container } = render(<Card>Content</Card>);
			expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
		});
	});

	describe("CardHeader", () => {
		it("should render card header", () => {
			render(
				<Card>
					<CardHeader>Header</CardHeader>
				</Card>,
			);
			expect(screen.getByText("Header")).toBeInTheDocument();
		});

		it("should have data-slot attribute", () => {
			render(
				<Card>
					<CardHeader>Header</CardHeader>
				</Card>,
			);
			expect(screen.getByText("Header")).toHaveAttribute(
				"data-slot",
				"card-header",
			);
		});
	});

	describe("CardTitle", () => {
		it("should render card title", () => {
			render(
				<Card>
					<CardHeader>
						<CardTitle>Title</CardTitle>
					</CardHeader>
				</Card>,
			);
			expect(screen.getByText("Title")).toBeInTheDocument();
		});
	});

	describe("CardDescription", () => {
		it("should render card description", () => {
			render(
				<Card>
					<CardHeader>
						<CardTitle>Title</CardTitle>
						<CardDescription>Description</CardDescription>
					</CardHeader>
				</Card>,
			);
			expect(screen.getByText("Description")).toBeInTheDocument();
		});
	});

	describe("CardAction", () => {
		it("should render card action", () => {
			render(
				<Card>
					<CardHeader>
						<CardTitle>Title</CardTitle>
						<CardAction>Action</CardAction>
					</CardHeader>
				</Card>,
			);
			expect(screen.getByText("Action")).toBeInTheDocument();
		});
	});

	describe("CardPanel (CardContent)", () => {
		it("should render card content panel", () => {
			render(
				<Card>
					<CardPanel>Content</CardPanel>
				</Card>,
			);
			expect(screen.getByText("Content")).toBeInTheDocument();
		});
	});

	describe("CardFooter", () => {
		it("should render card footer", () => {
			render(
				<Card>
					<CardFooter>Footer</CardFooter>
				</Card>,
			);
			expect(screen.getByText("Footer")).toBeInTheDocument();
		});
	});

	describe("Full Card Structure", () => {
		it("should render complete card with all components", () => {
			render(
				<Card>
					<CardHeader>
						<CardTitle>Card Title</CardTitle>
						<CardDescription>Card description goes here</CardDescription>
						<CardAction>Action</CardAction>
					</CardHeader>
					<CardPanel>Card content</CardPanel>
					<CardFooter>Card footer</CardFooter>
				</Card>,
			);

			expect(screen.getByText("Card Title")).toBeInTheDocument();
			expect(
				screen.getByText("Card description goes here"),
			).toBeInTheDocument();
			expect(screen.getByText("Action")).toBeInTheDocument();
			expect(screen.getByText("Card content")).toBeInTheDocument();
			expect(screen.getByText("Card footer")).toBeInTheDocument();
		});
	});
});
