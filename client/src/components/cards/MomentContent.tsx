interface MomentContentProps {
	content: string;
}

export default function MomentContent({ content }: MomentContentProps) {
	return (
		<div className="py-1">
			<p className="text-base leading-relaxed whitespace-pre-wrap text-foreground/90">
				{content}
			</p>
		</div>
	);
}
