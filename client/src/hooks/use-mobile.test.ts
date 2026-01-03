import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
	const originalInnerWidth = window.innerWidth;
	const originalMatchMedia = window.matchMedia;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		// Restore original window.innerWidth
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: originalInnerWidth,
		});
		window.matchMedia = originalMatchMedia;
	});

	it("should return true when screen width is less than breakpoint", () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 500,
		});

		vi.spyOn(window, "matchMedia").mockReturnValue({
			matches: true,
			media: "(max-width: 767px)",
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
		});

		const { result } = renderHook(() => useIsMobile());

		expect(result.current).toBe(true);
	});

	it("should return false when screen width is greater than breakpoint", () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 1000,
		});

		vi.spyOn(window, "matchMedia").mockReturnValue({
			matches: false,
			media: "(max-width: 767px)",
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
		});

		const { result } = renderHook(() => useIsMobile());

		expect(result.current).toBe(false);
	});

	it("should add and remove event listener on mount/unmount", () => {
		const addEventListener = vi.fn();
		const removeEventListener = vi.fn();

		vi.spyOn(window, "matchMedia").mockReturnValue({
			matches: false,
			media: "(max-width: 767px)",
			addEventListener,
			removeEventListener,
			dispatchEvent: vi.fn(),
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
		});

		const { unmount } = renderHook(() => useIsMobile());

		expect(addEventListener).toHaveBeenCalledWith(
			"change",
			expect.any(Function),
		);

		unmount();

		expect(removeEventListener).toHaveBeenCalledWith(
			"change",
			expect.any(Function),
		);
	});

	it("should use 768 as the mobile breakpoint", () => {
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 767,
		});

		vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
			matches: query === "(max-width: 767px)",
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
		}));

		const { result } = renderHook(() => useIsMobile());

		expect(result.current).toBe(true);
	});
});
