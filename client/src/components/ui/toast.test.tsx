import { toast as sonnerToast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
	},
}));

describe("toast", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("basic toast types", () => {
		it("should call sonner toast.success with correct params", async () => {
			const { toast } = await import("./toast");
			toast.success("Success message");

			expect(sonnerToast.success).toHaveBeenCalledWith(
				"Success message",
				expect.objectContaining({
					duration: 3000,
				}),
			);
		});

		it("should call sonner toast.error with correct params", async () => {
			const { toast } = await import("./toast");
			toast.error("Error message");

			expect(sonnerToast.error).toHaveBeenCalledWith(
				"Error message",
				expect.objectContaining({
					duration: 3000,
				}),
			);
		});

		it("should call sonner toast.info with correct params", async () => {
			const { toast } = await import("./toast");
			toast.info("Info message");

			expect(sonnerToast.info).toHaveBeenCalledWith(
				"Info message",
				expect.objectContaining({
					duration: 3000,
				}),
			);
		});

		it("should call sonner toast.warning with correct params", async () => {
			const { toast } = await import("./toast");
			toast.warning("Warning message");

			expect(sonnerToast.warning).toHaveBeenCalledWith(
				"Warning message",
				expect.objectContaining({
					duration: 3000,
				}),
			);
		});

		it("should support custom duration", async () => {
			const { toast } = await import("./toast");
			toast.success("Success", { duration: 5000 });

			expect(sonnerToast.success).toHaveBeenCalledWith(
				"Success",
				expect.objectContaining({
					duration: 5000,
				}),
			);
		});

		it("should support description", async () => {
			const { toast } = await import("./toast");
			toast.success("Title", { description: "Description text" });

			expect(sonnerToast.success).toHaveBeenCalledWith(
				"Title",
				expect.objectContaining({
					description: "Description text",
				}),
			);
		});
	});

	describe("action-specific toasts", () => {
		it("should show liked toast with heart icon", async () => {
			const { toast } = await import("./toast");
			toast.liked();

			expect(sonnerToast.success).toHaveBeenCalledWith(
				"已点赞",
				expect.objectContaining({
					duration: 2000,
				}),
			);
		});

		it("should show unliked toast", async () => {
			const { toast } = await import("./toast");
			toast.unliked();

			expect(sonnerToast.info).toHaveBeenCalledWith(
				"已取消点赞",
				expect.objectContaining({
					duration: 2000,
				}),
			);
		});

		it("should show bookmarked toast", async () => {
			const { toast } = await import("./toast");
			toast.bookmarked();

			expect(sonnerToast.success).toHaveBeenCalledWith(
				"已收藏",
				expect.objectContaining({
					duration: 2000,
				}),
			);
		});

		it("should show unbookmarked toast", async () => {
			const { toast } = await import("./toast");
			toast.unbookmarked();

			expect(sonnerToast.info).toHaveBeenCalledWith(
				"已取消收藏",
				expect.objectContaining({
					duration: 2000,
				}),
			);
		});

		it("should show followed toast with username", async () => {
			const { toast } = await import("./toast");
			toast.followed("testuser");

			expect(sonnerToast.success).toHaveBeenCalledWith(
				"已关注 testuser",
				expect.objectContaining({
					duration: 2000,
				}),
			);
		});

		it("should show followed toast without username", async () => {
			const { toast } = await import("./toast");
			toast.followed();

			expect(sonnerToast.success).toHaveBeenCalledWith(
				"已关注",
				expect.objectContaining({
					duration: 2000,
				}),
			);
		});

		it("should show unfollowed toast with username", async () => {
			const { toast } = await import("./toast");
			toast.unfollowed("testuser");

			expect(sonnerToast.info).toHaveBeenCalledWith(
				"已取消关注 testuser",
				expect.objectContaining({
					duration: 2000,
				}),
			);
		});

		it("should show copied toast", async () => {
			const { toast } = await import("./toast");
			toast.copied();

			expect(sonnerToast.success).toHaveBeenCalledWith(
				"已复制到剪贴板",
				expect.objectContaining({
					duration: 2000,
				}),
			);
		});

		it("should show shared toast", async () => {
			const { toast } = await import("./toast");
			toast.shared();

			expect(sonnerToast.success).toHaveBeenCalledWith(
				"分享链接已复制",
				expect.objectContaining({
					duration: 2000,
				}),
			);
		});

		it("should show authRequired toast as warning", async () => {
			const { toast } = await import("./toast");
			toast.authRequired();

			expect(sonnerToast.warning).toHaveBeenCalledWith(
				"请先登录",
				expect.objectContaining({
					duration: 3000,
				}),
			);
		});
	});
});
