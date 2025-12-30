import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TagInputProps {
	tags: string[];
	onChange: (tags: string[]) => void;
	maxTags?: number;
	suggestions?: string[];
	className?: string;
}

const DEFAULT_SUGGESTIONS = [
	"Java",
	"Spring",
	"React",
	"TypeScript",
	"Python",
	"Bug",
	"Tutorial",
	"算法",
];

export default function TagInput({
	tags,
	onChange,
	maxTags = 5,
	suggestions = DEFAULT_SUGGESTIONS,
	className,
}: TagInputProps) {
	const [input, setInput] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const filteredSuggestions = suggestions.filter(
		(s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s),
	);

	const addTag = (tag: string) => {
		const trimmed = tag.trim().replace(/^#/, "");
		if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
			onChange([...tags, trimmed]);
		}
		setInput("");
		setShowSuggestions(false);
	};

	const removeTag = (tagToRemove: string) => {
		onChange(tags.filter((t) => t !== tagToRemove));
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			if (input) addTag(input);
		} else if (e.key === "Backspace" && !input && tags.length > 0) {
			removeTag(tags[tags.length - 1]);
		}
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
				setShowSuggestions(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className={cn("relative", className)}>
			<div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
				{tags.map((tag) => (
					<span
						key={tag}
						className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-sm"
					>
						#{tag}
						<button
							type="button"
							onClick={() => removeTag(tag)}
							className="rounded hover:bg-muted"
						>
							<X className="h-3 w-3" />
						</button>
					</span>
				))}
				{tags.length < maxTags && (
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={(e) => {
							setInput(e.target.value);
							setShowSuggestions(true);
						}}
						onFocus={() => setShowSuggestions(true)}
						onKeyDown={handleKeyDown}
						placeholder={tags.length === 0 ? "添加话题..." : ""}
						className="min-w-[80px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
					/>
				)}
			</div>

			{/* Suggestions dropdown */}
			{showSuggestions && filteredSuggestions.length > 0 && input && (
				<div className="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border bg-popover p-1 shadow-md">
					{filteredSuggestions.slice(0, 5).map((suggestion) => (
						<button
							key={suggestion}
							type="button"
							onClick={() => addTag(suggestion)}
							className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
						>
							#{suggestion}
						</button>
					))}
				</div>
			)}

			<p className="mt-1 text-xs text-muted-foreground">
				最多 {maxTags} 个话题，按 Enter 或逗号添加
			</p>
		</div>
	);
}
