import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
	children: ReactNode;
	className?: string;
}

const fadeVariants = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
};

const slideRightVariants = {
	initial: { opacity: 0, x: 20 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -20 },
};

const scaleVariants = {
	initial: { opacity: 0, scale: 0.95 },
	animate: { opacity: 1, scale: 1 },
	exit: { opacity: 0, scale: 0.95 },
};

const slideUpVariants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
};

type TransitionType = "fade" | "slideRight" | "scale" | "slideUp";

const transitionVariants: Record<TransitionType, typeof fadeVariants> = {
	fade: fadeVariants,
	slideRight: slideRightVariants,
	scale: scaleVariants,
	slideUp: slideUpVariants,
};

interface AnimatedPageProps extends PageTransitionProps {
	transition?: TransitionType;
}

export function AnimatedPage({
	children,
	className,
	transition = "fade",
}: AnimatedPageProps) {
	const prefersReducedMotion = useReducedMotion();
	const variants = transitionVariants[transition];

	return (
		<motion.div
			className={className}
			initial={prefersReducedMotion ? "animate" : "initial"}
			animate="animate"
			exit={prefersReducedMotion ? "animate" : "exit"}
			variants={variants}
			transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
		>
			{children}
		</motion.div>
	);
}

interface StaggerContainerProps {
	children: ReactNode;
	className?: string;
	staggerDelay?: number;
}

export function StaggerContainer({
	children,
	className,
	staggerDelay = 0.05,
}: StaggerContainerProps) {
	const prefersReducedMotion = useReducedMotion();

	return (
		<motion.div
			className={className}
			initial={prefersReducedMotion ? "visible" : "hidden"}
			animate="visible"
			variants={{
				hidden: { opacity: 0 },
				visible: {
					opacity: 1,
					transition: {
						staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
					},
				},
			}}
		>
			{children}
		</motion.div>
	);
}

interface StaggerItemProps {
	children: ReactNode;
	className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
	const prefersReducedMotion = useReducedMotion();

	return (
		<motion.div
			className={className}
			variants={{
				hidden: { opacity: 0, y: 20 },
				visible: {
					opacity: 1,
					y: 0,
					transition: {
						duration: prefersReducedMotion ? 0 : 0.3,
						ease: "easeOut",
					},
				},
			}}
		>
			{children}
		</motion.div>
	);
}

interface SlideInProps {
	children: ReactNode;
	className?: string;
	direction?: "left" | "right" | "up" | "down";
	delay?: number;
}

const slideDirections = {
	left: { x: -20, y: 0 },
	right: { x: 20, y: 0 },
	up: { y: -20, x: 0 },
	down: { y: 20, x: 0 },
};

export function SlideIn({
	children,
	className,
	direction = "right",
	delay = 0,
}: SlideInProps) {
	const prefersReducedMotion = useReducedMotion();
	const offset = slideDirections[direction];

	return (
		<motion.div
			className={className}
			initial={
				prefersReducedMotion
					? { opacity: 1, x: 0, y: 0 }
					: { opacity: 0, ...offset }
			}
			animate={{ opacity: 1, x: 0, y: 0 }}
			transition={{
				duration: prefersReducedMotion ? 0 : 0.3,
				ease: "easeOut",
				delay: prefersReducedMotion ? 0 : delay,
			}}
		>
			{children}
		</motion.div>
	);
}

interface FadeInProps {
	children: ReactNode;
	className?: string;
	delay?: number;
	duration?: number;
}

export function FadeIn({
	children,
	className,
	delay = 0,
	duration = 0.3,
}: FadeInProps) {
	const prefersReducedMotion = useReducedMotion();

	return (
		<motion.div
			className={className}
			initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{
				duration: prefersReducedMotion ? 0 : duration,
				delay: prefersReducedMotion ? 0 : delay,
			}}
		>
			{children}
		</motion.div>
	);
}

export { AnimatePresence, motion };
