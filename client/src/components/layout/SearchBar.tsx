import { useLocation, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Menu,
	MenuCheckboxItem,
	MenuPopup,
	MenuTrigger,
} from "@/components/ui/menu";
import { useAllTags } from "@/hooks/useTags";
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
	const [tags, setTags] = useState<string[]>([]);
	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLFormElement>(null);
	const { data: allTags } = useAllTags(true);

	const isSearchPage = location.pathname === "/search";
	const urlParams = isSearchPage
		? (location.search as {
				keyword?: string;
				type?: PostType;
				tags?: string[] | string;
			})
		: null;

	useEffect(() => {
		if (urlParams) {
			setKeyword(urlParams.keyword ?? "");
			setType(urlParams.type ?? "all");
			let parsed: string[] = [];
			if (Array.isArray(urlParams.tags)) {
				parsed = urlParams.tags.filter(
					(t): t is string => typeof t === "string" && t.trim().length > 0,
				);
			} else if (typeof urlParams.tags === "string" && urlParams.tags.trim()) {
				parsed = urlParams.tags
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean);
			}
			setTags(parsed);
		} else {
			setKeyword("");
			setType("all");
			setTags([]);
		}
	}, [urlParams]);

	const handleSearch = useCallback(() => {
		navigate({
			to: "/search",
			search: {
				keyword: keyword.trim(),
				...(type !== "all" && { type }),
				...(tags.length > 0 && { tags }),
			},
		});
	}, [keyword, type, tags, navigate]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleSearch();
	};

	const handleClear = () => {
		setKeyword("");
		setType("all");
		setTags([]);
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

	useEffect(() => {
		if (!isSearchPage) return;
		const hasCriteria =
			keyword.trim().length > 0 || type !== "all" || tags.length > 0;
		if (!hasCriteria) return;
		const id = setTimeout(() => {
			navigate({
				to: "/search",
				replace: true,
				search: {
					keyword: keyword.trim(),
					...(type !== "all" && { type }),
					...(tags.length > 0 && { tags }),
				},
			});
		}, 400);
		return () => clearTimeout(id);
	}, [isSearchPage, keyword, type, tags, navigate]);

	const sortedTags = useMemo(() => {
		return (allTags ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));
	}, [allTags]);

	const toggleTag = (name: string) => {
		setTags((prev) =>
			prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name],
		);
	};

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
				<Menu>
					<MenuTrigger
						className="search-bar-filter-chip"
						aria-label="选择标签"
						aria-haspopup="menu"
						type="button"
					>
						{tags.length ? `标签(${tags.length})` : "标签"}
					</MenuTrigger>
					<MenuPopup align="start" sideOffset={6}>
						<div className="max-h-64 overflow-y-auto">
							{sortedTags.map((t) => (
								<MenuCheckboxItem
									key={t.id}
									checked={tags.includes(t.name)}
									onCheckedChange={() => toggleTag(t.name)}
									onSelect={(e) => {
										// Keep menu open while multi-selecting
										e.preventDefault();
									}}
								>
									{t.name}
								</MenuCheckboxItem>
							))}
						</div>
					</MenuPopup>
				</Menu>
				{tags.length > 0 && (
					<button
						type="button"
						className="search-bar-filter-chip"
						aria-label="清除全部标签"
						onClick={() => setTags([])}
						title="清除全部标签"
					>
						清除标签
						<span
							aria-hidden="true"
							style={{ marginLeft: 6, display: "inline-flex" }}
						>
							<X width={12} height={12} />
						</span>
					</button>
				)}
			</div>
		</form>
	);
}
