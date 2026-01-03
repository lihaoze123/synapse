import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
	it("should render button with default variant", () => {
		render(<Button>Click me</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveTextContent("Click me");
		expect(button.tagName).toBe("BUTTON");
	});

	it("should apply variant classes", () => {
		const { rerender } = render(<Button variant="destructive">Delete</Button>);
		expect(screen.getByRole("button")).toHaveClass("border-destructive");

		rerender(<Button variant="outline">Outline</Button>);
		expect(screen.getByRole("button")).toHaveClass("border-border");
	});

	it("should apply size classes", () => {
		const { rerender } = render(<Button size="sm">Small</Button>);
		expect(screen.getByRole("button")).toHaveClass("h-8");

		rerender(<Button size="lg">Large</Button>);
		expect(screen.getByRole("button")).toHaveClass("h-10");
	});

	it("should apply custom className", () => {
		render(<Button className="custom-class">Test</Button>);
		expect(screen.getByRole("button")).toHaveClass("custom-class");
	});

	it("should be disabled when disabled prop is true", () => {
		render(<Button disabled>Disabled</Button>);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("should render as different element with render prop", () => {
		render(
			// biome-ignore lint/a11y/useAnchorContent: Children become anchor content
			<Button render={<a href="https://example.com" />}>Link text</Button>,
		);
		expect(screen.getByRole("link")).toHaveAttribute(
			"href",
			"https://example.com",
		);
	});
});
