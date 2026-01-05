import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("IllustratedEmptyState", () => {
	describe("variants", () => {
		it("should render default variant with correct text", async () => {
			const { IllustratedEmptyState } = await import("./IllustratedEmptyState");
			render(<IllustratedEmptyState />);

			expect(screen.getByText("暂无内容")).toBeInTheDocument();
			expect(screen.getByText("这里空空如也")).toBeInTheDocument();
		});

		it("should render posts variant", async () => {
			const { IllustratedEmptyState } = await import("./IllustratedEmptyState");
			render(<IllustratedEmptyState variant="posts" />);

			expect(screen.getByText("暂无内容")).toBeInTheDocument();
			expect(screen.getByText("成为第一个分享的人吧！")).toBeInTheDocument();
		});

		it("should render comments variant", async () => {
			const { IllustratedEmptyState } = await import("./IllustratedEmptyState");
			render(<IllustratedEmptyState variant="comments" />);

			expect(screen.getByText("暂无评论")).toBeInTheDocument();
			expect(screen.getByText("快来发表你的看法吧！")).toBeInTheDocument();
		});

		it("should render notifications variant", async () => {
			const { IllustratedEmptyState } = await import("./IllustratedEmptyState");
			render(<IllustratedEmptyState variant="notifications" />);

			expect(screen.getByText("暂无通知")).toBeInTheDocument();
			expect(screen.getByText("新的互动消息会显示在这里")).toBeInTheDocument();
		});

		it("should render bookmarks variant", async () => {
			const { IllustratedEmptyState } = await import("./IllustratedEmptyState");
			render(<IllustratedEmptyState variant="bookmarks" />);

			expect(screen.getByText("暂无收藏")).toBeInTheDocument();
			expect(
				screen.getByText("收藏喜欢的内容，方便稍后查看"),
			).toBeInTheDocument();
		});

		it("should render search variant", async () => {
			const { IllustratedEmptyState } = await import("./IllustratedEmptyState");
			render(<IllustratedEmptyState variant="search" />);

			expect(screen.getByText("未找到结果")).toBeInTheDocument();
			expect(screen.getByText("尝试使用不同的关键词搜索")).toBeInTheDocument();
		});

		it("should render followers variant", async () => {
			const { IllustratedEmptyState } = await import("./IllustratedEmptyState");
			render(<IllustratedEmptyState variant="followers" />);

			expect(screen.getByText("暂无粉丝")).toBeInTheDocument();
			expect(screen.getByText("分享更多内容来吸引关注者")).toBeInTheDocument();
		});

		it("should render following variant", async () => {
			const { IllustratedEmptyState } = await import("./IllustratedEmptyState");
			render(<IllustratedEmptyState variant="following" />);

			expect(screen.getByText("暂未关注")).toBeInTheDocument();
			expect(
				screen.getByText("关注感兴趣的用户，发现更多内容"),
			).toBeInTheDocument();
		});
	});

	describe("custom content", () => {
		it("should override title when provided", async () => {
			const { IllustratedEmptyState } = await import("./IllustratedEmptyState");
			render(<IllustratedEmptyState title="Custom Title" />);

			expect(screen.getByText("Custom Title")).toBeInTheDocument();
		});

		it("should override description when provided", async () => {
			const { IllustratedEmptyState } = await import("./IllustratedEmptyState");
			render(<IllustratedEmptyState description="Custom Description" />);

			expect(screen.getByText("Custom Description")).toBeInTheDocument();
		});

		it("should accept className prop", async () => {
			const { IllustratedEmptyState } = await import("./IllustratedEmptyState");
			const { container } = render(
				<IllustratedEmptyState className="custom-class" />,
			);

			const card = container.querySelector('[data-slot="card"]');
			expect(card).toHaveClass("custom-class");
		});

		it("should render action when provided", async () => {
			const { IllustratedEmptyState } = await import("./IllustratedEmptyState");
			render(
				<IllustratedEmptyState
					action={<button type="button">Click me</button>}
				/>,
			);

			expect(
				screen.getByRole("button", { name: "Click me" }),
			).toBeInTheDocument();
		});
	});
});
