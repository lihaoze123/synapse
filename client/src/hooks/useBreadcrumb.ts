import { useMatches } from "@tanstack/react-router";
import type { BreadcrumbItemType } from "@/components/ui/breadcrumb";

type Match = ReturnType<typeof useMatches>[number];

type BreadcrumbConfig = {
	label: string | ((match: Match) => string);
	href?: string;
};

export function useBreadcrumb(): BreadcrumbItemType[] {
	const matches = useMatches();

	const breadcrumbItems: BreadcrumbItemType[] = [];

	for (const match of matches) {
		const staticData = match.staticData as
			| { breadcrumb?: BreadcrumbConfig }
			| undefined;

		if (staticData?.breadcrumb) {
			const breadcrumb = staticData.breadcrumb;

			const label =
				typeof breadcrumb.label === "function"
					? breadcrumb.label(match)
					: breadcrumb.label;

			breadcrumbItems.push({
				id: match.id,
				label,
				href: breadcrumb.href,
			});
		}
	}

	// 如果没有面包屑配置，默认显示首页
	if (breadcrumbItems.length === 0) {
		return [{ id: "home", label: "首页" }];
	}

	// 如果第一项不是"首页"，自动添加"首页"作为第一层级
	if (breadcrumbItems[0].label !== "首页") {
		breadcrumbItems.unshift({
			id: "home",
			label: "首页",
			href: "/",
		});
	}

	// 移除最后一项的 href（当前页面不需要链接）
	const lastItem = breadcrumbItems[breadcrumbItems.length - 1];
	delete lastItem.href;

	return breadcrumbItems;
}
