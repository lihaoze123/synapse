import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { go } from "@codemirror/lang-go";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import {
	bracketMatching,
	foldGutter,
	indentOnInput,
} from "@codemirror/language";
import { EditorState, type Extension } from "@codemirror/state";
import {
	EditorView,
	highlightActiveLine,
	highlightActiveLineGutter,
	keymap,
	lineNumbers,
	placeholder as placeholderExt,
} from "@codemirror/view";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CodeMirrorEditorProps {
	value: string;
	onChange: (value: string) => void;
	language?: string;
	placeholder?: string;
	readOnly?: boolean;
	minHeight?: string;
	className?: string;
}

const languageExtensions: Record<string, () => Extension> = {
	javascript: () => javascript(),
	typescript: () => javascript({ typescript: true }),
	jsx: () => javascript({ jsx: true }),
	tsx: () => javascript({ jsx: true, typescript: true }),
	python: () => python(),
	java: () => java(),
	c: () => cpp(),
	cpp: () => cpp(),
	csharp: () => cpp(),
	go: () => go(),
	rust: () => rust(),
	html: () => html(),
	css: () => css(),
	json: () => json(),
	markdown: () => markdown(),
	sql: () => sql(),
	php: () => php(),
	bash: () => [],
	yaml: () => [],
	ruby: () => [],
	swift: () => [],
	kotlin: () => java(),
};

const theme = EditorView.theme({
	"&": {
		backgroundColor: "transparent",
		fontSize: "14px",
	},
	"&.cm-focused": {
		outline: "none",
	},
	".cm-scroller": {
		fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
		lineHeight: "1.6",
	},
	".cm-content": {
		caretColor: "var(--color-foreground)",
		padding: "12px 0",
	},
	".cm-line": {
		padding: "0 12px",
	},
	".cm-gutters": {
		backgroundColor: "transparent",
		color: "oklch(0.6 0.02 60)",
		border: "none",
		paddingRight: "4px",
	},
	".cm-lineNumbers .cm-gutterElement": {
		padding: "0 8px 0 12px",
		minWidth: "32px",
		textAlign: "right",
	},
	".cm-foldGutter .cm-gutterElement": {
		padding: "0 4px",
	},
	".cm-activeLine": {
		backgroundColor: "oklch(0.97 0.01 60 / 0.5)",
	},
	".cm-activeLineGutter": {
		backgroundColor: "transparent",
		color: "oklch(0.5 0.05 60)",
	},
	"&.cm-focused .cm-cursor": {
		borderLeftColor: "oklch(0.65 0.15 60)",
		borderLeftWidth: "2px",
	},
	"&.cm-focused .cm-selectionBackground, ::selection": {
		backgroundColor: "oklch(0.85 0.1 60 / 0.3) !important",
	},
	".cm-selectionMatch": {
		backgroundColor: "oklch(0.9 0.08 60 / 0.4)",
	},
	".cm-matchingBracket": {
		backgroundColor: "oklch(0.85 0.12 60 / 0.4)",
		outline: "1px solid oklch(0.7 0.12 60)",
		borderRadius: "2px",
	},
	".cm-placeholder": {
		color: "oklch(0.6 0.02 60)",
		fontStyle: "italic",
	},
});

export default function CodeMirrorEditor({
	value,
	onChange,
	language = "javascript",
	placeholder = "",
	readOnly = false,
	minHeight = "200px",
	className,
}: CodeMirrorEditorProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const onChangeRef = useRef(onChange);
	const isInternalChange = useRef(false);
	const initialValueRef = useRef(value);

	onChangeRef.current = onChange;

	useEffect(() => {
		if (!containerRef.current) return;

		const langExt = languageExtensions[language]?.() ?? [];

		const extensions: Extension[] = [
			lineNumbers(),
			highlightActiveLineGutter(),
			highlightActiveLine(),
			foldGutter(),
			bracketMatching(),
			indentOnInput(),
			keymap.of([...defaultKeymap, indentWithTab]),
			theme,
			EditorView.lineWrapping,
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					isInternalChange.current = true;
					onChangeRef.current(update.state.doc.toString());
				}
			}),
		];

		if (placeholder) {
			extensions.push(placeholderExt(placeholder));
		}

		if (langExt) {
			extensions.push(langExt);
		}

		if (readOnly) {
			extensions.push(EditorState.readOnly.of(true));
		}

		const state = EditorState.create({
			doc: initialValueRef.current,
			extensions,
		});

		const view = new EditorView({
			state,
			parent: containerRef.current,
		});

		viewRef.current = view;

		return () => {
			view.destroy();
			viewRef.current = null;
		};
	}, [language, placeholder, readOnly]);

	useEffect(() => {
		if (isInternalChange.current) {
			isInternalChange.current = false;
			return;
		}

		const view = viewRef.current;
		if (!view) return;

		const currentValue = view.state.doc.toString();
		if (currentValue !== value) {
			view.dispatch({
				changes: {
					from: 0,
					to: currentValue.length,
					insert: value,
				},
			});
		}
	}, [value]);

	return (
		<div
			ref={containerRef}
			style={{ minHeight }}
			className={cn(
				"overflow-hidden rounded-lg border border-input bg-background",
				"focus-within:ring-2 focus-within:ring-ring/50 focus-within:border-ring",
				"transition-shadow duration-200",
				className,
			)}
		/>
	);
}
