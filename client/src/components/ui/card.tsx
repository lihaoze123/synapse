import type * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"relative flex flex-col rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50",
				"transition-colors duration-150",
				"hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900",
				className,
			)}
			data-slot="card"
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
				className,
			)}
			data-slot="card-header"
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("font-semibold text-lg leading-none", className)}
			data-slot="card-title"
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("text-muted-foreground text-sm", className)}
			data-slot="card-description"
			{...props}
		/>
	);
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"col-start-2 row-span-2 row-start-1 self-start justify-self-end",
				className,
			)}
			data-slot="card-action"
			{...props}
		/>
	);
}

function CardPanel({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("px-6", className)}
			data-slot="card-content"
			{...props}
		/>
	);
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
			data-slot="card-footer"
			{...props}
		/>
	);
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardAction,
	CardDescription,
	CardPanel,
	CardPanel as CardContent,
};
