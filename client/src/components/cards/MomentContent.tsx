interface MomentContentProps {
	content: string;
}

export default function MomentContent({ content }: MomentContentProps) {
	return (
		<div className="py-1">
			<p className="text-lg leading-relaxed whitespace-pre-wrap">{content}</p>
		</div>
	);
}
