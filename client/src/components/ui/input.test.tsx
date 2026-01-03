import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input", () => {
	it("should render input field", () => {
		render(<Input />);
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("should apply placeholder", () => {
		render(<Input placeholder="Enter text" />);
		expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
	});

	it("should apply custom className", () => {
		render(<Input className="custom-class" />);
		expect(screen.getByRole("textbox").closest("span")).toHaveClass(
			"custom-class",
		);
	});

	it("should apply size prop", () => {
		const { rerender } = render(<Input size="sm" />);
		expect(screen.getByRole("textbox").closest("span")).toHaveAttribute(
			"data-size",
			"sm",
		);

		rerender(<Input size="lg" />);
		expect(screen.getByRole("textbox").closest("span")).toHaveAttribute(
			"data-size",
			"lg",
		);
	});

	it("should handle numeric size", () => {
		render(<Input size={20} />);
		const input = screen.getByRole("textbox");
		expect(input).toHaveAttribute("size", "20");
	});

	it("should be disabled when disabled prop is true", () => {
		render(<Input disabled />);
		expect(screen.getByRole("textbox")).toBeDisabled();
	});

	it("should handle different input types", () => {
		const { rerender } = render(<Input type="password" />);
		expect(screen.getByDisplayValue("")).toHaveAttribute("type", "password");

		rerender(<Input type="search" />);
		expect(screen.getByRole("searchbox")).toHaveAttribute("type", "search");
	});

	it("should apply unstyled prop", () => {
		render(<Input unstyled />);
		const container = screen.getByRole("textbox").closest("span");
		expect(container).not.toHaveClass("border", "rounded-md");
	});

	it("should accept value changes", () => {
		render(<Input defaultValue="test" />);
		expect(screen.getByDisplayValue("test")).toBeInTheDocument();
	});
});
