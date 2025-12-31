import { useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { PostType } from "@/types";

const POST_TYPE_OPTIONS = ["all", "SNIPPET", "ARTICLE", "MOMENT"] as const;
type FilterType = (typeof POST_TYPE_OPTIONS)[number];

const POST_TYPE_LABELS: Record<FilterType, string> = {
	all: "全部",
	SNIPPET: "代码片段",
	ARTICLE: "文章",
	MOMENT: "动态",
};

export function SearchBar() {
	const navigate = useNavigate();
	const location = useLocation();
	const [keyword, setKeyword] = useState("");
	const [type, setType] = useState<FilterType>("all");
	const [typeOpen, setTypeOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

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

	useEffect(() => {
		if (!typeOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node;
			if (
				!dropdownRef.current?.contains(target) &&
				!triggerRef.current?.contains(target)
			) {
				setTypeOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [typeOpen]);

	const handleSearch = () => {
		if (!keyword.trim()) return;

		navigate({
			to: "/search",
			search: {
				keyword: keyword.trim(),
				...(type !== "all" && { type }),
			},
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		handleSearch();
	};

	const handleClear = () => {
		setKeyword("");
		setType("all");
		if (isSearchPage) {
			navigate({ to: "/" });
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			setTypeOpen(false);
			triggerRef.current?.focus();
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex items-center gap-1.5">
			<div className="relative flex items-center group">
				<Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
				<Input
					type="search"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					placeholder="搜索后按回车..."
					aria-label="搜索内容"
					className="w-44 md:w-56 h-9 pl-9 pr-8 rounded-xl border-border/60 bg-secondary/50 focus-within:bg-background"
				/>
				{keyword ? (
					<button
						type="button"
						onClick={handleClear}
						aria-label="清除搜索"
						className="absolute right-2.5 p-0.5 text-muted-foreground hover:text-foreground rounded transition-colors"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				) : (
					<span className="absolute right-2.5 text-[10px] text-muted-foreground/60 hidden group-focus-within:inline">
						↵
					</span>
				)}
			</div>

			<button
				type="submit"
				disabled={!keyword.trim()}
				aria-label="搜索"
				className="hidden sm:flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
			>
				<Search className="h-4 w-4" />
			</button>

			<div className="relative hidden sm:block">
				<button
					ref={triggerRef}
					type="button"
					onClick={() => setTypeOpen(!typeOpen)}
					aria-expanded={typeOpen}
					aria-haspopup="listbox"
					aria-label="选择内容类型"
					className="flex items-center gap-1 px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors"
				>
					<span>{POST_TYPE_LABELS[type]}</span>
					<ChevronDown
						className={`h-3.5 w-3.5 transition-transform ${typeOpen ? "rotate-180" : ""}`}
					/>
				</button>

				{typeOpen && (
					<div
						ref={dropdownRef}
						role="listbox"
						aria-label="内容类型"
						onKeyDown={handleKeyDown}
						className="absolute top-full right-0 mt-1.5 z-50 min-w-[120px] bg-popover border border-border/60 rounded-xl shadow-lg p-1 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
					>
						{POST_TYPE_OPTIONS.map((typeOption) => (
							<button
								key={typeOption}
								type="button"
								role="option"
								aria-selected={type === typeOption}
								onClick={() => {
									setType(typeOption);
									setTypeOpen(false);
								}}
								className={`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
									type === typeOption
										? "bg-primary/10 text-primary font-medium"
										: "text-foreground hover:bg-secondary"
								}`}
							>
								{POST_TYPE_LABELS[typeOption]}
							</button>
						))}
					</div>
				)}
			</div>
		</form>
	);
}
