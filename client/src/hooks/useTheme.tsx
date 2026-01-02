import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	systemTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "theme";

function getSystemTheme(): "light" | "dark" {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function getStoredTheme(): Theme {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored === "light" || stored === "dark" || stored === "system") {
		return stored;
	}
	return "system";
}

function applyTheme(theme: Theme) {
	const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
	const root = document.documentElement;

	if (resolvedTheme === "dark") {
		root.classList.add("dark");
	} else {
		root.classList.remove("dark");
	}

	// Update theme-color meta tag
	const metaThemeColor = document.querySelector('meta[name="theme-color"]');
	if (metaThemeColor) {
		metaThemeColor.setAttribute(
			"content",
			resolvedTheme === "dark" ? "#171717" : "#FFFFFF",
		);
	}
}

export interface ThemeProviderProps {
	children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(getStoredTheme);
	const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
		getSystemTheme,
	);

	// Apply theme when theme state or system theme changes
	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	// Listen for system theme changes
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
			const newSystemTheme = e.matches ? "dark" : "light";
			setSystemTheme(newSystemTheme);
			if (theme === "system") {
				applyTheme("system");
			}
		};

		// Use addListener for older Safari support
		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
		localStorage.setItem(STORAGE_KEY, newTheme);
	};

	return (
		<ThemeContext value={{ theme, setTheme, systemTheme }}>
			{children}
		</ThemeContext>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
