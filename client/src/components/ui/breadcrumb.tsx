import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
	return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
	return (
		<ol
			className={cn(
				"wrap-break-word flex flex-wrap items-center gap-1.5 text-muted-foreground text-sm sm:gap-2.5",
				className,
			)}
			data-slot="breadcrumb-list"
			{...props}
		/>
	);
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
	return (
		<li
			className={cn("inline-flex items-center gap-1.5", className)}
			data-slot="breadcrumb-item"
			{...props}
		/>
	);
}

function BreadcrumbLink({
	className,
	render,
	...props
}: useRender.ComponentProps<"a">) {
	const defaultProps = {
		className: cn("transition-colors hover:text-foreground", className),
		"data-slot": "breadcrumb-link",
	};

	return useRender({
		defaultTagName: "a",
		props: mergeProps<"a">(defaultProps, props),
		render,
	});
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
	return (
		// biome-ignore lint(a11y/useFocusableInteractive): known
		<span
			aria-current="page"
			aria-disabled="true"
			className={cn("font-normal text-foreground", className)}
			data-slot="breadcrumb-page"
			role="link"
			{...props}
		/>
	);
}

function BreadcrumbSeparator({
	children,
	className,
	...props
}: React.ComponentProps<"li">) {
	return (
		<li
			aria-hidden="true"
			className={cn("opacity-80 [&>svg]:size-4", className)}
			data-slot="breadcrumb-separator"
			role="presentation"
			{...props}
		>
			{children ?? <ChevronRight />}
		</li>
	);
}

function BreadcrumbEllipsis({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			aria-hidden="true"
			className={className}
			data-slot="breadcrumb-ellipsis"
			role="presentation"
			{...props}
		>
			<MoreHorizontal className="size-4" />
			<span className="sr-only">More</span>
		</span>
	);
}

export interface BreadcrumbItemType {
	id: string;
	label: string;
	href?: string;
	icon?: LucideIcon;
}

interface BreadcrumbWithItemsProps {
	items: BreadcrumbItemType[];
	className?: string;
}

export function BreadcrumbWithItems({
	items,
	className,
}: BreadcrumbWithItemsProps) {
	return (
		<Breadcrumb className={className}>
			<BreadcrumbList>
				{items.map((item, index) => (
					<div key={item.id} className="flex items-center gap-1.5">
						{index > 0 && <BreadcrumbSeparator />}
						<BreadcrumbItem>
							{item.href ? (
								<BreadcrumbLink render={<Link to={item.href} />}>
									{item.icon && (
										<item.icon className="h-4 w-4 mr-1" aria-hidden="true" />
									)}
									{item.label}
								</BreadcrumbLink>
							) : (
								<BreadcrumbPage>
									{item.icon && (
										<item.icon className="h-4 w-4 mr-1" aria-hidden="true" />
									)}
									{item.label}
								</BreadcrumbPage>
							)}
						</BreadcrumbItem>
					</div>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}

export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
};
