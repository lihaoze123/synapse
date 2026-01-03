import "@testing-library/dom";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Create a functional storage mock that actually stores data
const createStorageMock = () => {
	const store: Record<string, string> = {};

	const mock = {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, value: string) => {
			store[key] = value.toString();
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			Object.keys(store).forEach((key) => {
				delete store[key];
			});
		},
		get length() {
			return Object.keys(store).length;
		},
		key: (index: number) => Object.keys(store)[index] ?? null,
		// Helper for testing
		_getStore: () => store,
	};

	// Make it enumerable like real localStorage
	return new Proxy(mock, {
		ownKeys: () => [...Object.keys(mock), ...Object.keys(store)],
		getOwnPropertyDescriptor: (target, prop) => {
			if (typeof prop === "string" && Object.hasOwn(store, prop)) {
				return { enumerable: true, configurable: true, value: store[prop] };
			}
			return Object.getOwnPropertyDescriptor(target, prop as never);
		},
	});
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

// Make Object.keys work with the mock
Object.defineProperty(window, "localStorage", {
	value: new Proxy(localStorageMock, {
		ownKeys: () =>
			Object.keys(
				(
					localStorageMock as unknown as { _getStore(): Record<string, string> }
				)._getStore(),
			),
		getOwnPropertyDescriptor: (target, prop) => {
			if (typeof prop === "string") {
				return { enumerable: true, configurable: true };
			}
			return Object.getOwnPropertyDescriptor(target, prop as never);
		},
	}),
});

Object.defineProperty(window, "sessionStorage", {
	value: new Proxy(sessionStorageMock, {
		ownKeys: () =>
			Object.keys(
				(
					sessionStorageMock as unknown as {
						_getStore(): Record<string, string>;
					}
				)._getStore(),
			),
		getOwnPropertyDescriptor: (target, prop) => {
			if (typeof prop === "string") {
				return { enumerable: true, configurable: true };
			}
			return Object.getOwnPropertyDescriptor(target, prop as never);
		},
	}),
});

// Clear storage before each test
beforeEach(() => {
	localStorageMock.clear();
	sessionStorageMock.clear();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
	readonly root: Element | Document | null = null;
	readonly rootMargin: string = "";
	readonly thresholds: ReadonlyArray<number> = [];
	disconnect(): void {}
	observe(): void {}
	takeRecords(): IntersectionObserverEntry[] {
		return [];
	}
	unobserve(): void {}
}

Object.defineProperty(window, "IntersectionObserver", {
	writable: true,
	configurable: true,
	value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
	disconnect(): void {}
	observe(): void {}
	unobserve(): void {}
}

Object.defineProperty(window, "ResizeObserver", {
	writable: true,
	configurable: true,
	value: MockResizeObserver,
});

// Mock toast for sonner
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		promise: vi.fn(),
	},
}));
