import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import {
	useBookmarkCount,
	useBookmarkStatus,
	useBookmarkToggle,
} from "../../hooks/useBookmarks";
import { BookmarkButton } from "./BookmarkButton";

vi.mock("../../hooks/useAuth");
vi.mock("../../hooks/useBookmarks");

const mockUseAuth = vi.mocked(useAuth);
const mockUseBookmarkStatus = vi.mocked(useBookmarkStatus);
const mockUseBookmarkCount = vi.mocked(useBookmarkCount);
const mockUseBookmarkToggle = vi.mocked(useBookmarkToggle);

describe("BookmarkButton", () => {
	let queryClient: QueryClient;

	beforeEach(() => {
		queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false, staleTime: 0 },
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
		loginWithGitHub: vi.fn(),
		loginWithGoogle: vi.fn(),
		isLoggingIn: false,
		isRegistering: false,
		loginError: null,
		registerError: null,
	};

	describe("not bookmarked", () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(defaultAuthState);
			mockUseBookmarkStatus.mockReturnValue({
				data: false,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);
			mockUseBookmarkCount.mockReturnValue({
				data: 5,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);
			mockUseBookmarkToggle.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue(true),
				isPending: false,
			} as any);
		});

		it("should render with initial state", () => {
			render(<BookmarkButton postId={1} />, { wrapper });

			expect(screen.getByText("5")).toBeInTheDocument();
			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("aria-pressed", "false");
		});

		it("should toggle bookmark on click", () => {
			const mutateMock = vi.fn();
			mockUseBookmarkToggle.mockReturnValue({
				mutate: mutateMock,
				mutateAsync: vi.fn().mockResolvedValue(true),
				isPending: false,
			} as any);

			render(<BookmarkButton postId={1} />, { wrapper });

			const button = screen.getByRole("button");
			fireEvent.click(button);

			expect(mutateMock).toHaveBeenCalledWith(false);
		});

		it("should be disabled while toggling", () => {
			mockUseBookmarkToggle.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue(true),
				isPending: true,
			} as any);

			render(<BookmarkButton postId={1} />, { wrapper });

			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("aria-busy", "true");
			expect(button).toBeDisabled();
		});
	});

	describe("bookmarked", () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(defaultAuthState);
			mockUseBookmarkStatus.mockReturnValue({
				data: true,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);
			mockUseBookmarkCount.mockReturnValue({
				data: 5,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);
			mockUseBookmarkToggle.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue(false),
				isPending: false,
			} as any);
		});

		it("should render as bookmarked", () => {
			render(<BookmarkButton postId={1} />, { wrapper });

			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("aria-pressed", "true");
			expect(button.className).toContain("border-amber-200");
		});

		it("should remove bookmark on click", () => {
			const mutateMock = vi.fn();
			mockUseBookmarkToggle.mockReturnValue({
				mutate: mutateMock,
				mutateAsync: vi.fn().mockResolvedValue(false),
				isPending: false,
			} as any);

			render(<BookmarkButton postId={1} />, { wrapper });

			const button = screen.getByRole("button");
			fireEvent.click(button);

			expect(mutateMock).toHaveBeenCalledWith(true);
		});
	});

	describe("loading states", () => {
		it("should show loading while fetching status", () => {
			mockUseAuth.mockReturnValue(defaultAuthState);
			mockUseBookmarkStatus.mockReturnValue({
				data: false,
				isFetching: true,
				isLoading: false,
				isSuccess: false,
			} as any);
			mockUseBookmarkCount.mockReturnValue({
				data: 5,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);
			mockUseBookmarkToggle.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue(true),
				isPending: false,
			} as any);

			render(<BookmarkButton postId={1} />, { wrapper });

			const button = screen.getByRole("button");
			expect(button).toHaveAttribute("aria-busy", "true");
			expect(button).toBeDisabled();
		});
	});

	describe("count display", () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(defaultAuthState);
			mockUseBookmarkStatus.mockReturnValue({
				data: false,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);
			mockUseBookmarkToggle.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue(true),
				isPending: false,
			} as any);
		});

		it("should show count when available", () => {
			mockUseBookmarkCount.mockReturnValue({
				data: 10,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);

			render(<BookmarkButton postId={1} />, { wrapper });

			expect(screen.getByText("10")).toBeInTheDocument();
		});

		it("should show placeholder while loading count", () => {
			mockUseBookmarkCount.mockReturnValue({
				data: undefined,
				isFetching: true,
				isLoading: false,
				isSuccess: false,
			} as any);

			render(<BookmarkButton postId={1} />, { wrapper });

			expect(screen.getByText("...")).toBeInTheDocument();
		});

		it("should show dash when no count", () => {
			mockUseBookmarkCount.mockReturnValue({
				data: null,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);

			render(<BookmarkButton postId={1} />, { wrapper });

			expect(screen.getByText("—")).toBeInTheDocument();
		});

		it("should hide count when showCount is false", () => {
			mockUseBookmarkCount.mockReturnValue({
				data: 10,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);

			render(<BookmarkButton postId={1} showCount={false} />, { wrapper });

			expect(screen.queryByText("10")).not.toBeInTheDocument();
		});
	});

	describe("initial count", () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(defaultAuthState);
			mockUseBookmarkStatus.mockReturnValue({
				data: false,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);
			mockUseBookmarkToggle.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue(true),
				isPending: false,
			} as any);
		});

		it("should use initial count data", () => {
			mockUseBookmarkCount.mockReturnValue({
				data: 15,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);

			render(<BookmarkButton postId={1} initialCount={15} />, { wrapper });

			expect(screen.getByText("15")).toBeInTheDocument();
		});
	});

	describe("not authenticated", () => {
		it("should show toast error when clicked", () => {
			mockUseAuth.mockReturnValue({
				...defaultAuthState,
				user: null,
				isAuthenticated: false,
			});
			mockUseBookmarkStatus.mockReturnValue({
				data: false,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);
			mockUseBookmarkCount.mockReturnValue({
				data: 5,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);
			mockUseBookmarkToggle.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue(true),
				isPending: false,
			} as any);

			render(<BookmarkButton postId={1} />, { wrapper });

			const button = screen.getByRole("button");
			fireEvent.click(button);

			expect(toast.error).toHaveBeenCalledWith("请先登录再收藏");
		});
	});

	describe("size variants", () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(defaultAuthState);
			mockUseBookmarkStatus.mockReturnValue({
				data: false,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);
			mockUseBookmarkCount.mockReturnValue({
				data: 5,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);
			mockUseBookmarkToggle.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue(true),
				isPending: false,
			} as any);
		});

		it("should render small size", () => {
			render(<BookmarkButton postId={1} size="sm" />, { wrapper });

			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});

		it("should render medium size", () => {
			render(<BookmarkButton postId={1} size="md" />, { wrapper });

			const button = screen.getByRole("button");
			expect(button).toBeInTheDocument();
		});
	});

	describe("custom className", () => {
		beforeEach(() => {
			mockUseAuth.mockReturnValue(defaultAuthState);
			mockUseBookmarkStatus.mockReturnValue({
				data: false,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);
			mockUseBookmarkCount.mockReturnValue({
				data: 5,
				isFetching: false,
				isLoading: false,
				isSuccess: true,
			} as any);
			mockUseBookmarkToggle.mockReturnValue({
				mutate: vi.fn(),
				mutateAsync: vi.fn().mockResolvedValue(true),
				isPending: false,
			} as any);
		});

		it("should apply custom className", () => {
			const { container } = render(
				<BookmarkButton postId={1} className="custom-class" />,
				{ wrapper },
			);

			const button = container.querySelector("button");
			expect(button?.className).toContain("custom-class");
		});
	});
});
