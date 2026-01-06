import { describe, expect, it } from "vitest";
import { emailValidationError, isValidEmail } from "./validation";

describe("validation", () => {
	describe("isValidEmail", () => {
		it("should accept valid email addresses", () => {
			expect(isValidEmail("test@example.com")).toBe(true);
			expect(isValidEmail("user.name@example.com")).toBe(true);
			expect(isValidEmail("user+tag@example.co.uk")).toBe(true);
		});

		it("should reject invalid email addresses", () => {
			expect(isValidEmail("")).toBe(false);
			expect(isValidEmail("invalid")).toBe(false);
			expect(isValidEmail("@example.com")).toBe(false);
			expect(isValidEmail("test@")).toBe(false);
			expect(isValidEmail("test @example.com")).toBe(false); // spaces not allowed
		});
	});

	it("should have correct error message", () => {
		expect(emailValidationError).toBe("Invalid email address");
	});
});
