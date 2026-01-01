import type { TanStackDevtoolsReactPlugin } from "@tanstack/react-devtools";
import { lazy } from "react";

const LazyDevtools = import.meta.env.DEV
	? lazy(async () => {
			const [{ TanStackDevtools }, { TanStackRouterDevtoolsPanel }] =
				await Promise.all([
					import("@tanstack/react-devtools"),
					import("@tanstack/react-router-devtools"),
				]);

			return {
				default: (props: { plugins?: TanStackDevtoolsReactPlugin[] }) => (
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							...(props.plugins ?? []),
						]}
					/>
				),
			};
		})
	: null;

export default function Devtools({
	plugins,
}: {
	plugins?: TanStackDevtoolsReactPlugin[];
}) {
	if (!import.meta.env.DEV || !LazyDevtools) {
		return null;
	}

	return <LazyDevtools plugins={plugins} />;
}
