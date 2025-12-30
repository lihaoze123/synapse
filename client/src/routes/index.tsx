import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<div className="min-h-screen bg-gray-100 p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-800 mb-4">
					Welcome to Synapse
				</h1>
				<p className="text-gray-600">
					A topic-based content aggregation platform.
				</p>
			</div>
		</div>
	);
}
