import { useLocation, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PostType } from "@/types";

const POST_TYPE_OPTIONS = ["all", "SNIPPET", "ARTICLE", "MOMENT"] as const;
type FilterType = (typeof POST_TYPE_OPTIONS)[number];

const POST_TYPE_CONFIG: Record<
	FilterType,
	{ label: string; shortLabel: string }
> = {
	all: { label: "全部", shortLabel: "全部" },
	SNIPPET: { label: "代码片段", shortLabel: "代码" },
	ARTICLE: { label: "文章", shortLabel: "文章" },
	MOMENT: { label: "动态", shortLabel: "动态" },
};

export function SearchBar() {
	const navigate = useNavigate();
	const location = useLocation();
	const [keyword, setKeyword] = useState("");
	const [type, setType] = useState<FilterType>("all");
	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLFormElement>(null);

	const isSearchPage = location.pathname === "/search";
	const urlParams = isSearchPage
		? (location.search as { keyword?: string; type?: PostType })
		: null;

	useEffect(() => {
		if (urlParams) {
			setKeyword(urlParams.keyword ?? "");
			setType(urlParams.type ?? "all");
		} else {
			setKeyword("");
			setType("all");
		}
	}, [urlParams]);

	const handleSearch = useCallback(() => {
		if (!keyword.trim()) return;
		navigate({
			to: "/search",
			search: {
				keyword: keyword.trim(),
				...(type !== "all" && { type }),
			},
		});
	}, [keyword, type, navigate]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleSearch();
	};

	const handleClear = () => {
		setKeyword("");
		setType("all");
		inputRef.current?.focus();
		if (isSearchPage) {
			navigate({ to: "/" });
		}
	};

	const handleTypeChange = (newType: FilterType) => {
		setType(newType);
		inputRef.current?.focus();
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				inputRef.current?.focus();
			}
			if (e.key === "Escape" && isFocused) {
				inputRef.current?.blur();
				setIsFocused(false);
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isFocused]);

	return (
		<form
			ref={containerRef}
			onSubmit={handleSubmit}
			className="search-bar-container"
			data-focused={isFocused}
		>
			<div className="search-bar-inner">
				<Search
					className="search-bar-icon"
					strokeWidth={2}
					aria-hidden="true"
				/>

				<input
					ref={inputRef}
					type="text"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					placeholder="搜索内容..."
					aria-label="搜索内容"
					className="search-bar-input"
				/>

				{keyword && (
					<button
						type="button"
						onClick={handleClear}
						aria-label="清除搜索"
						className="search-bar-clear"
					>
						<X strokeWidth={2.5} />
					</button>
				)}
			</div>

			<div className="search-bar-filters">
				{POST_TYPE_OPTIONS.map((typeOption) => (
					<button
						key={typeOption}
						type="button"
						aria-pressed={type === typeOption}
						onClick={() => handleTypeChange(typeOption)}
						className="search-bar-filter-chip"
						data-active={type === typeOption}
					>
						{POST_TYPE_CONFIG[typeOption].shortLabel}
					</button>
				))}
			</div>
		</form>
	);
}
