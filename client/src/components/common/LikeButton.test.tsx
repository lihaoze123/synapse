import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import { useLikeComment, useLikePost } from "../../hooks/useLikes";
import { LikeButton } from "./LikeButton";

vi.mock("../../hooks/useAuth");
vi.mock("../../hooks/useLikes");

const mockUseAuth = vi.mocked(useAuth);
const mockUseLikePost = vi.mocked(useLikePost);
const mockUseLikeComment = vi.mocked(useLikeComment);

describe("LikeButton", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});
		vi.clearAllMocks();
		vi.mocked(toast.error).mockClear();
	});

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);

	const defaultAuthState = {
		user: { id: 1, username: "testuser", avatarUrl: null },
		isAuthenticated: true,
		isValidating: false,
		login: vi.fn().mockResolvedValue({}),
		register: vi.fn().mockResolvedValue({}),
		logout: vi.fn(),
		isLoggingIn: false,
		isRegistering: false,
		loginError: null,
		registerError: null,
	};

	describe("post type - default appearance", () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(defaultAuthState);
			mockUseLikePost.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue({ liked: true, count: 6 }),
				isPending: false,
			} as any);
			mockUseLikeComment.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue({ liked: true, count: 4 }),
				isPending: false,
			} as any);
		});

		it("should render with initial state", () => {
			render(
				<LikeButton
					targetId={1}
					type="post"
					initialLiked={false}
					initialCount={5}
				/>,
				{ wrapper },
			);

			expect(screen.getByText("5")).toBeInTheDocument();
			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("aria-pressed", "false");
		});

		it("should render as liked", () => {
			render(
				<LikeButton
					targetId={1}
					type="post"
					initialLiked={true}
					initialCount={5}
				/>,
				{ wrapper },
			);

			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("aria-pressed", "true");
			expect(button.className).toContain("border-rose-200");
		});

		it("should toggle like on click", async () => {
			const mutateAsyncMock = vi
				.fn()
				.mockResolvedValue({ liked: true, count: 6 });
			mockUseLikePost.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: mutateAsyncMock,
				isPending: false,
			} as any);

			render(
				<LikeButton
					targetId={1}
					type="post"
					initialLiked={false}
					initialCount={5}
				/>,
				{ wrapper },
			);

			const button = screen.getByRole("button");

			await act(async () => {
				fireEvent.click(button);
				await mutateAsyncMock.mock.results[0]?.value;
			});

			expect(mutateAsyncMock).toHaveBeenCalled();
		});

		it("should show optimistic update", async () => {
			let resolveLike: (value: { liked: boolean; count: number }) => void;
			const mutateAsyncMock = vi.fn().mockImplementation(
				() =>
					new Promise((resolve) => {
						resolveLike = resolve;
					}),
			);
			mockUseLikePost.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: mutateAsyncMock,
				isPending: false,
			} as any);

			render(
				<LikeButton
					targetId={1}
					type="post"
					initialLiked={false}
					initialCount={5}
				/>,
				{ wrapper },
			);

			const button = screen.getByRole("button");

			// Click triggers optimistic update immediately
			await act(async () => {
				fireEvent.click(button);
			});

			// Optimistic update should be visible
			expect(button).toHaveAttribute("aria-pressed", "true");
			expect(screen.getByText("6")).toBeInTheDocument();

			// Server response
			await act(async () => {
				resolveLike!({ liked: true, count: 6 });
			});
		});

		it("should rollback on error", async () => {
			const mutateAsyncMock = vi.fn().mockRejectedValue(new Error("Failed"));
			mockUseLikePost.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: mutateAsyncMock,
				isPending: false,
			} as any);

			render(
				<LikeButton
					targetId={1}
					type="post"
					initialLiked={false}
					initialCount={5}
				/>,
				{ wrapper },
			);

			const button = screen.getByRole("button");

			// Click triggers optimistic update, then rollback on error
			await act(async () => {
				fireEvent.click(button);
				try {
					await mutateAsyncMock.mock.results[0]?.value;
				} catch {
					// Expected rejection
				}
			});

			// Should rollback to original state
			await waitFor(() => {
				expect(button).toHaveAttribute("aria-pressed", "false");
			});
		});

		it("should show loading state", () => {
			mockUseLikePost.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue({ liked: true, count: 6 }),
				isPending: true,
			} as any);

			render(
				<LikeButton
					targetId={1}
					type="post"
					initialLiked={false}
					initialCount={5}
				/>,
				{ wrapper },
			);

			expect(screen.getByText("5")).toBeInTheDocument();
			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("aria-busy", "true");
			expect(button).toBeDisabled();
		});

		it("should show toast error when not logged in", () => {
			mockUseAuth.mockReturnValue({
				...defaultAuthState,
				user: null,
				isAuthenticated: false,
			});

			render(
				<LikeButton
					targetId={1}
					type="post"
					initialLiked={false}
					initialCount={5}
				/>,
				{ wrapper },
			);

			const button = screen.getByRole("button");
			fireEvent.click(button);

			expect(toast.error).toHaveBeenCalledWith("请先登录再点赞");
		});
	});

	describe("comment type", () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(defaultAuthState);
			mockUseLikePost.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue({ liked: true, count: 6 }),
				isPending: false,
			} as any);
			mockUseLikeComment.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue({ liked: true, count: 4 }),
				isPending: false,
			} as any);
		});

		it("should toggle like on comment", async () => {
			const mutateAsyncMock = vi
				.fn()
				.mockResolvedValue({ liked: true, count: 4 });
			mockUseLikeComment.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: mutateAsyncMock,
				isPending: false,
			} as any);

			render(
				<LikeButton
					targetId={1}
					type="comment"
					initialLiked={false}
					initialCount={3}
				/>,
				{ wrapper },
			);

			const button = screen.getByRole("button");

			await act(async () => {
				fireEvent.click(button);
				await mutateAsyncMock.mock.results[0]?.value;
			});

			expect(mutateAsyncMock).toHaveBeenCalled();
		});
	});

	describe("FAB appearance", () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(defaultAuthState);
			mockUseLikePost.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue({ liked: true, count: 6 }),
				isPending: false,
			} as any);
			mockUseLikeComment.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue({ liked: true, count: 4 }),
				isPending: false,
			} as any);
		});

		it("should render as FAB", () => {
			render(
				<LikeButton
					targetId={1}
					type="post"
					initialLiked={false}
					initialCount={5}
					appearance="fab"
				/>,
				{ wrapper },
			);

			const button = screen.getByRole("button");
			expect(button.className).toContain("rounded-full");
		});

		it("should show count badge when count > 0", () => {
			render(
				<LikeButton
					targetId={1}
					type="post"
					initialLiked={false}
					initialCount={100}
					appearance="fab"
				/>,
				{ wrapper },
			);

			expect(screen.getByText("100")).toBeInTheDocument();
		});

		it("should show 999+ for large counts", () => {
			render(
				<LikeButton
					targetId={1}
					type="post"
					initialLiked={false}
					initialCount={1000}
					appearance="fab"
				/>,
				{ wrapper },
			);

			expect(screen.getByText("999+")).toBeInTheDocument();
		});
	});

	describe("size variants", () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(defaultAuthState);
			mockUseLikePost.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue({ liked: true, count: 6 }),
				isPending: false,
			} as any);
			mockUseLikeComment.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue({ liked: true, count: 4 }),
				isPending: false,
			} as any);
		});

		it("should render small size", () => {
			render(
				<LikeButton
					targetId={1}
					type="post"
					initialLiked={false}
					initialCount={5}
					size="sm"
				/>,
				{ wrapper },
			);

			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});

		it("should render medium size", () => {
			render(
				<LikeButton
					targetId={1}
					type="post"
					initialLiked={false}
					initialCount={5}
					size="md"
				/>,
				{ wrapper },
			);

			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});
	});
});
