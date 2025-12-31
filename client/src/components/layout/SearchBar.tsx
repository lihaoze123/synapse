import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import type { PostType } from "@/types";

const POST_TYPE_LABELS: Record<PostType | "all", string> = {
	all: "全部",
	SNIPPET: "代码片段",
	ARTICLE: "文章",
	MOMENT: "动态",
};

interface SearchBarProps {
	defaultKeyword?: string;
	defaultType?: PostType | "all";
}

export function SearchBar({
	defaultKeyword = "",
	defaultType = "all",
}: SearchBarProps) {
	const navigate = useNavigate();
	const [keyword, setKeyword] = useState(defaultKeyword);
	const [type, setType] = useState<PostType | "all">(defaultType);
	const [typeOpen, setTypeOpen] = useState(false);

	useEffect(() => {
		setKeyword(defaultKeyword);
	}, [defaultKeyword]);

	const performSearch = useCallback(
		(searchKeyword: string, searchType: PostType | "all") => {
			if (!searchKeyword.trim()) return;

			navigate({
				to: "/search",
				search: searchType === "all"
					? { keyword: searchKeyword.trim() }
					: { keyword: searchKeyword.trim(), type: searchType as PostType },
			});
		},
		[navigate],
	);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (keyword.trim()) {
				performSearch(keyword, type);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [keyword, type, performSearch]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		performSearch(keyword, type);
	};

	const handleClear = () => {
		setKeyword("");
	};

	return (
		<form onSubmit={handleSubmit} className="flex items-center gap-2">
			<div className="relative flex items-center">
				<Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
				<Input
					type="text"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					placeholder="搜索内容..."
					className="w-48 md:w-64 h-9 pl-8 pr-8"
				/>
				{keyword && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				)}
			</div>

			<button
				type="button"
				onClick={() => setTypeOpen(!typeOpen)}
				className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
			>
				<span>{POST_TYPE_LABELS[type]}</span>
			</button>

			{typeOpen && (
				<div className="absolute top-14 right-20 z-50 bg-popover border rounded-lg shadow-lg p-1 min-w-[120px]">
					{(Object.keys(POST_TYPE_LABELS) as (PostType | "all")[]).map(
						(typeOption) => (
							<button
								key={typeOption}
								type="button"
								onClick={() => {
									setType(typeOption);
									setTypeOpen(false);
								}}
								className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
									type === typeOption
										? "bg-accent text-accent-foreground"
										: "hover:bg-secondary"
								}`}
							>
								{POST_TYPE_LABELS[typeOption]}
							</button>
						),
					)}
				</div>
			)}
		</form>
	);
}
