import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "./useTheme";

describe("useTheme", () => {
	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<ThemeProvider>{children}</ThemeProvider>
	);

	it("should provide theme context", () => {
		const { result } = renderHook(() => useTheme(), { wrapper });

		expect(result.current).toHaveProperty("theme");
		expect(result.current).toHaveProperty("setTheme");
		expect(result.current).toHaveProperty("systemTheme");
	});

	it("should default to system theme", () => {
		const { result } = renderHook(() => useTheme(), { wrapper });

		expect(result.current.theme).toBe("system");
	});

	it("should throw error when used outside provider", () => {
		expect(() => {
			renderHook(() => useTheme());
		}).toThrow("useTheme must be used within a ThemeProvider");
	});

	it("should change theme", () => {
		const { result } = renderHook(() => useTheme(), { wrapper });

		act(() => {
			result.current.setTheme("dark");
		});

		expect(result.current.theme).toBe("dark");
		expect(localStorage.getItem("theme")).toBe("dark");
	});

	it("should apply dark class to document when theme is dark", () => {
		const { result } = renderHook(() => useTheme(), { wrapper });

		act(() => {
			result.current.setTheme("dark");
		});

		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	it("should remove dark class when theme is light", () => {
		const { result } = renderHook(() => useTheme(), { wrapper });

		act(() => {
			result.current.setTheme("dark");
		});
		expect(document.documentElement.classList.contains("dark")).toBe(true);

		act(() => {
			result.current.setTheme("light");
		});
		expect(document.documentElement.classList.contains("dark")).toBe(false);
	});

	it("should load stored theme from localStorage", () => {
		localStorage.setItem("theme", "light");

		const { result } = renderHook(() => useTheme(), { wrapper });

		expect(result.current.theme).toBe("light");
	});

	it("should default to system when stored theme is invalid", () => {
		localStorage.setItem("theme", "invalid");

		const { result } = renderHook(() => useTheme(), { wrapper });

		expect(result.current.theme).toBe("system");
	});
});
