import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "@/hooks/useTheme";
import { ThemeToggle } from "./ThemeToggle";

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<ThemeProvider>{children}</ThemeProvider>
);

describe("ThemeToggle", () => {
	it("should render toggle button", () => {
		render(<ThemeToggle />, { wrapper });
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("should have correct aria-label in light mode", () => {
		render(<ThemeToggle />, { wrapper });
		expect(screen.getByRole("button")).toHaveAttribute(
			"aria-label",
			"Switch to dark mode",
		);
	});

	it("should toggle theme on click", async () => {
		const user = userEvent.setup();

		render(<ThemeToggle />, { wrapper });

		// Initially in light mode (system default)
		const button = screen.getByRole("button", { name: /switch to dark/i });
		expect(button).toBeInTheDocument();

		// Click to switch to dark
		await user.click(button);

		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /switch to light/i }),
			).toBeInTheDocument();
		});
	});
});
