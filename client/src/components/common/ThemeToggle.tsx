import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme.tsx";

export function ThemeToggle() {
	const { theme, setTheme, systemTheme } = useTheme();

	// Resolve current theme (for 'system', use the detected system theme)
	const resolvedTheme = theme === "system" ? systemTheme : theme;
	const isDark = resolvedTheme === "dark";

	const toggleTheme = () => {
		setTheme(isDark ? "light" : "dark");
	};

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
		>
			<Sun
				className="h-4 w-4 rotate-0 scale-100 dark:hidden"
				aria-hidden="true"
			/>
			<Moon
				className="absolute h-4 w-4 hidden dark:block"
				aria-hidden="true"
			/>
		</button>
	);
}
