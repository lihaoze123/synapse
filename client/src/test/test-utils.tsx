import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	type createMemoryRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { type RenderOptions, render } from "@testing-library/react";

// Test-friendly QueryClient
export function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
	});
}

interface TestProvidersProps {
	children: React.ReactNode;
	queryClient?: QueryClient;
	router?: ReturnType<typeof createMemoryRouter>;
}

export function TestProviders({
	children,
	queryClient,
	router,
}: TestProvidersProps) {
	const testQueryClient = queryClient ?? createTestQueryClient();

	if (router) {
		return <RouterProvider router={router} />;
	}

	return (
		<QueryClientProvider client={testQueryClient}>
			{children}
		</QueryClientProvider>
	);
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
	queryClient?: QueryClient;
	router?: ReturnType<typeof createMemoryRouter>;
}

export function renderWithProviders(
	ui: React.ReactElement,
	options?: CustomRenderOptions,
) {
	const { queryClient, router, ...renderOptions } = options ?? {};

	const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
		<TestProviders queryClient={queryClient} router={router}>
			{children}
		</TestProviders>
	);

	return {
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
	};
}

// Re-export testing library utilities
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
