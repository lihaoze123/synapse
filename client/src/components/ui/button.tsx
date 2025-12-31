import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"[&_svg]:-mx-0.5 relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border font-medium text-sm outline-none transition-colors duration-150 pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='opacity-'])]:opacity-70 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		defaultVariants: {
			size: "default",
			variant: "default",
		},
		variants: {
			size: {
				default: "h-9 px-3",
				icon: "size-9",
				"icon-lg": "size-10",
				"icon-sm": "size-8",
				"icon-xl": "size-11 [&_svg:not([class*='size-'])]:size-5",
				"icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
				lg: "h-10 px-4",
				sm: "h-8 gap-1.5 px-2.5",
				xl: "h-11 px-5 text-base [&_svg:not([class*='size-'])]:size-5",
				xs: "h-7 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
			},
			variant: {
				default:
					"border-primary bg-primary text-primary-foreground hover:bg-primary/90",
				destructive:
					"border-destructive bg-destructive text-white hover:bg-destructive/90",
				"destructive-outline":
					"border-destructive/30 bg-transparent text-destructive hover:bg-destructive/5",
				ghost: "border-transparent hover:bg-accent",
				link: "border-transparent underline-offset-4 hover:underline",
				outline: "border-border bg-background hover:bg-accent",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
			},
		},
	},
);

interface ButtonProps extends useRender.ComponentProps<"button"> {
	variant?: VariantProps<typeof buttonVariants>["variant"];
	size?: VariantProps<typeof buttonVariants>["size"];
}

function Button({ className, variant, size, render, ...props }: ButtonProps) {
	const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
		render ? undefined : "button";

	const defaultProps = {
		className: cn(buttonVariants({ className, size, variant })),
		"data-slot": "button",
		type: typeValue,
	};

	return useRender({
		defaultTagName: "button",
		props: mergeProps<"button">(defaultProps, props),
		render,
	});
}

export { Button, buttonVariants };
