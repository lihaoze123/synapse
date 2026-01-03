import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
	it("should merge class names correctly", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	it("should handle conditional classes", () => {
		expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
	});

	it("should handle undefined and null values", () => {
		expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
	});

	it("should handle empty strings", () => {
		expect(cn("foo", "", "bar")).toBe("foo bar");
	});

	it("should merge Tailwind classes correctly", () => {
		expect(cn("p-4", "p-2")).toBe("p-2");
	});

	it("should handle arrays of classes", () => {
		expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
	});

	it("should handle objects with boolean values", () => {
		expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
	});

	it("should handle complex combinations", () => {
		expect(
			cn("base-class", { "class-a": true, "class-b": false }, [
				"class-c",
				undefined,
			]),
		).toBe("base-class class-a class-c");
	});
});
