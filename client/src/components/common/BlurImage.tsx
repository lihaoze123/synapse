import { motion } from "framer-motion";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface BlurImageProps {
	src: string;
	alt: string;
	className?: string;
	containerClassName?: string;
	placeholderColor?: string;
	aspectRatio?: string;
	onClick?: () => void;
}

export function BlurImage({
	src,
	alt,
	className,
	containerClassName,
	placeholderColor = "bg-gray-200 dark:bg-gray-800",
	aspectRatio,
	onClick,
}: BlurImageProps) {
	const [isLoaded, setIsLoaded] = useState(false);
	const [hasError, setHasError] = useState(false);

	const handleLoad = useCallback(() => {
		setIsLoaded(true);
	}, []);

	const handleError = useCallback(() => {
		setHasError(true);
	}, []);

	if (onClick) {
		return (
			<button
				type="button"
				className={cn("relative overflow-hidden", containerClassName)}
				style={aspectRatio ? { aspectRatio } : undefined}
				onClick={onClick}
				aria-label={alt}
			>
				{renderContent()}
			</button>
		);
	}

	return (
		<div
			className={cn("relative overflow-hidden", containerClassName)}
			style={aspectRatio ? { aspectRatio } : undefined}
		>
			{renderContent()}
		</div>
	);

	function renderContent() {
		if (hasError) {
			return (
				<div
					className={cn(
						"flex items-center justify-center w-full h-full",
						placeholderColor,
					)}
				>
					<span className="text-sm text-muted-foreground">加载失败</span>
				</div>
			);
		}

		return (
			<>
				<motion.div
					initial={{ opacity: 1 }}
					animate={{ opacity: isLoaded ? 0 : 1 }}
					transition={{ duration: 0.3 }}
					className={cn("absolute inset-0", placeholderColor)}
					style={{ willChange: "opacity" }}
				>
					<div className="absolute inset-0 animate-pulse" />
					<div
						className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"
						style={{
							animation: "shimmer 1.5s infinite",
						}}
					/>
				</motion.div>

				<motion.img
					src={src}
					alt={alt}
					loading="lazy"
					onLoad={handleLoad}
					onError={handleError}
					initial={{ opacity: 0, filter: "blur(10px)" }}
					animate={{
						opacity: isLoaded ? 1 : 0,
						filter: isLoaded ? "blur(0px)" : "blur(10px)",
					}}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className={cn("w-full h-full object-cover", className)}
					style={{ willChange: "opacity, filter" }}
				/>
			</>
		);
	}
}
