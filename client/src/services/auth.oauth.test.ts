import { beforeEach, describe, expect, it, vi } from "vitest";
import { authService } from "./auth";

describe("authService - OAuth", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Clear localStorage
		localStorage.clear();
	});

	it("should return GitHub OAuth authorization URL", () => {
		const url = authService.getOAuthAuthorizationUrl("github");
		expect(url).toBe("/oauth2/authorization/github");
	});

	it("should return Google OAuth authorization URL", () => {
		const url = authService.getOAuthAuthorizationUrl("google");
		expect(url).toBe("/oauth2/authorization/google");
	});

	it("should store OAuth state before redirect", () => {
		const state = "random-state-123";
		authService.saveOAuthState(state);
		expect(localStorage.getItem("oauth_state")).toBe(state);
	});

	it("should retrieve and clear OAuth state", () => {
		localStorage.setItem("oauth_state", "test-state");
		const state = authService.consumeOAuthState();
		expect(state).toBe("test-state");
		expect(localStorage.getItem("oauth_state")).toBeNull();
	});

	it("should generate random OAuth state", () => {
		const state1 = authService.generateOAuthState();
		const state2 = authService.generateOAuthState();
		expect(state1).not.toBe(state2);
		expect(state1.length).toBeGreaterThan(10);
	});
});
