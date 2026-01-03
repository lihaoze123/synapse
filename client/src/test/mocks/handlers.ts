import { HttpResponse, http } from "msw";

export const handlers = [
	// Auth handlers
	http.post("/api/auth/login", () => {
		return HttpResponse.json({
			token: "test-jwt-token",
			user: {
				id: 1,
				username: "testuser",
				avatarUrl: null,
			},
		});
	}),

	http.post("/api/auth/register", () => {
		return HttpResponse.json({
			token: "test-jwt-token",
			user: {
				id: 1,
				username: "testuser",
				avatarUrl: null,
			},
		});
	}),

	// Posts handlers
	http.get("/api/posts", () => {
		return HttpResponse.json({
			content: [
				{
					id: 1,
					type: "SNIPPET",
					title: "Test Snippet",
					content: 'console.log("hello")',
					language: "javascript",
					summary: null,
					coverImage: null,
					isPrivate: false,
					password: null,
					createdAt: "2024-01-01T00:00:00Z",
					user: {
						id: 1,
						username: "testuser",
						avatarUrl: null,
					},
					tags: [],
					likesCount: 0,
					commentsCount: 0,
					isLiked: false,
					isBookmarked: false,
				},
			],
			pageable: {
				pageNumber: 0,
				pageSize: 20,
			},
			totalElements: 1,
			totalPages: 1,
		});
	}),

	http.get("/api/posts/:id", ({ params }) => {
		return HttpResponse.json({
			id: Number(params.id),
			type: "SNIPPET",
			title: "Test Snippet",
			content: 'console.log("hello")',
			language: "javascript",
			summary: null,
			coverImage: null,
			isPrivate: false,
			password: null,
			createdAt: "2024-01-01T00:00:00Z",
			user: {
				id: 1,
				username: "testuser",
				avatarUrl: null,
			},
			tags: [],
			likesCount: 0,
			commentsCount: 0,
			isLiked: false,
			isBookmarked: false,
		});
	}),

	http.post("/api/posts", () => {
		return HttpResponse.json({
			id: 1,
			type: "SNIPPET",
			title: "Test Snippet",
			content: 'console.log("hello")',
			language: "javascript",
		});
	}),

	// Tags handlers
	http.get("/api/tags", () => {
		return HttpResponse.json([
			{ id: 1, name: "JavaScript", icon: "js" },
			{ id: 2, name: "Python", icon: "py" },
			{ id: 3, name: "React", icon: "react" },
		]);
	}),

	// Users handlers
	http.get("/api/users/:id", ({ params }) => {
		return HttpResponse.json({
			id: Number(params.id),
			username: "testuser",
			avatarUrl: null,
			bio: null,
			followersCount: 0,
			followingCount: 0,
		});
	}),

	// Comments handlers
	http.get("/api/posts/:postId/comments", () => {
		return HttpResponse.json({
			content: [],
			pageable: { pageNumber: 0, pageSize: 20 },
			totalElements: 0,
			totalPages: 0,
		});
	}),

	// Likes handlers
	http.post("/api/likes/posts/:postId", () => {
		return HttpResponse.json({ liked: true });
	}),

	// Bookmarks handlers
	http.get("/api/bookmarks", () => {
		return HttpResponse.json({
			content: [],
			pageable: { pageNumber: 0, pageSize: 20 },
			totalElements: 0,
			totalPages: 0,
		});
	}),

	http.post("/api/bookmarks/posts/:postId", () => {
		return HttpResponse.json({ bookmarked: true });
	}),

	// Follows handlers
	http.get("/api/follows/check/:userId", () => {
		return HttpResponse.json({ following: false });
	}),

	http.get("/api/follows/counts/:userId", () => {
		return HttpResponse.json({
			followersCount: 0,
			followingCount: 0,
		});
	}),

	http.post("/api/follows/:userId", () => {
		return HttpResponse.json({ following: true });
	}),

	// Notifications handlers
	http.get("/api/notifications", () => {
		return HttpResponse.json({
			content: [],
			pageable: { pageNumber: 0, pageSize: 20 },
			totalElements: 0,
			totalPages: 0,
		});
	}),

	http.get("/api/notifications/unread-count", () => {
		return HttpResponse.json({ count: 0 });
	}),
];
