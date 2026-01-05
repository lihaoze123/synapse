import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { Button } from "@/components/ui/button";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.props.onError?.(error, errorInfo);
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback ?? (
					<div className="flex min-h-screen items-center justify-center p-4">
						<div className="text-center">
							<div className="mb-4 inline-flex rounded-full bg-rose-100 p-4 dark:bg-rose-900/20">
								<svg
									className="h-12 w-12 text-rose-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									role="img"
									aria-label="错误提示"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
							</div>
							<h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
								出错了
							</h2>
							<p className="mb-6 text-gray-600 dark:text-gray-400">
								页面遇到了一些问题，请刷新页面重试
							</p>
							<Button
								onClick={() => window.location.reload()}
								variant="default"
							>
								刷新页面
							</Button>
						</div>
					</div>
				)
			);
		}

		return this.props.children;
	}
}
