"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";
import type * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = Omit<
	InputPrimitive.Props & React.RefAttributes<HTMLInputElement>,
	"size"
> & {
	size?: "sm" | "default" | "lg" | number;
	unstyled?: boolean;
};

function Input({
	className,
	size = "default",
	unstyled = false,
	...props
}: InputProps) {
	return (
		<span
			className={
				cn(
					!unstyled &&
						"relative inline-flex w-full rounded-md border border-input bg-background text-sm transition-colors has-focus-visible:border-ring has-focus-visible:ring-1 has-focus-visible:ring-ring/50 has-aria-invalid:border-destructive has-disabled:opacity-50",
					className,
				) || undefined
			}
			data-size={size}
			data-slot="input-control"
		>
			<InputPrimitive
				className={cn(
					"h-9 w-full min-w-0 rounded-[inherit] px-3 outline-none placeholder:text-muted-foreground",
					size === "sm" && "h-8 px-2.5 text-xs",
					size === "lg" && "h-10",
					props.type === "search" &&
						"[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
					props.type === "file" &&
						"text-muted-foreground file:me-3 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
				)}
				data-slot="input"
				size={typeof size === "number" ? size : undefined}
				{...props}
			/>
		</span>
	);
}

export { Input, type InputProps };
