# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Synapse** (突触) - A topic-based content aggregation platform combining:
- Reddit-style topic/tag system
- Gist-style code snippets
- Blog-style articles with Markdown
- Twitter-style micro-posts ("Moments")

This is a course project (课程设计). Implementation is in progress - basic CRUD operations, authentication, file upload, and search functionality are complete.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Coss UI, TanStack Query + Router |
| Code/Text | CodeMirror (code editor with syntax highlighting), react-markdown |
| Lint/Format | Biome (frontend), Checkstyle (backend) |
| Testing | Vitest + Testing Library (frontend), JUnit 5 (backend) |
| Backend | Spring Boot 3.2, Spring Data JPA (Hibernate) |
| Database | MySQL (production) / H2 (demo) |
| Auth | JWT (jjwt library) |
| File Storage | Local `uploads/` folder with UUID naming |
| Theme | Custom dark mode with system preference detection |
| State | localStorage (drafts, theme), sessionStorage (unlocked posts) |

## Build & Run Commands

**Backend (Spring Boot):** `server/`
```bash
# Build
./mvnw clean package

# Run
./mvnw spring-boot:run

# Test
./mvnw test

# Lint (Checkstyle)
./mvnw checkstyle:check
```

**Frontend (React + Vite):** `client/`
```bash
bun install

# Development
bun run dev      # Dev server at http://localhost:3000

# Build
bun run build    # Production build

# Test (Vitest)
bun run test

# Lint & Format (Biome)
bun run lint     # Check for lint errors
bun run format   # Check formatting
bun run check    # Lint + format combined
```

## Build & Deployment

### Development Mode

Run frontend and backend separately:

```bash
# Backend (port 8080)
cd server && ./mvnw spring-boot:run

# Frontend (port 3000, proxies to backend)
cd client && bun run dev
```

Frontend dev server uses Vite proxy to forward `/api` requests to `http://localhost:8080`.

### Production Deployment

**1. Build frontend with relative paths**
```bash
cd client
VITE_API_BASE_URL=/api VITE_STATIC_BASE_URL= bun run build
```

**2. Integrate with backend**
```bash
# Copy frontend build to Spring Boot static directory
cp -r client/dist/* server/src/main/resources/static/
```

**3. Build backend**
```bash
cd server
./mvnw clean package
```

**4. Run**
```bash
java -jar target/synapse-0.0.1-SNAPSHOT.jar
```

访问 `http://localhost:8080`，both frontend and API on the same port.

### Important: Vite Environment Variables

- **Vite env vars are build-time fixed**: `VITE_API_BASE_URL` is compiled into the JS bundle during `npm run build`
- **Cannot be changed at runtime**: Setting `VITE_API_BASE_URL` when running Java has no effect
- **Use relative paths for deployment**: Build with `/api` to use same-origin requests
- **Rebuild to change endpoints**: If API endpoint changes, rebuild frontend with new `VITE_API_BASE_URL`

## Architecture

### Backend Package Structure
```
com.synapse/
├── config/           # CORS, StaticResourceConfig, JwtConfig
├── controller/       # AuthController, PostController, TagController, CommentController, CommentLikeController, BookmarkController, FollowController, LikeController, UserController, FileController, NotificationController
├── dto/              # Request/Response DTOs (ApiResponse, PostDto, CommentDto, NotificationDto, VerifyPasswordRequest, etc.)
├── entity/           # User, Post, Tag, Comment, CommentLike, Bookmark, Follow, Like, Notification (JPA Entities)
├── repository/       # JPA Repository interfaces
├── service/          # Business logic (AuthService, PostService, NotificationService, etc.)
└── utils/            # JWTUtil, FileUtil
```

### Frontend Structure
```
src/
├── components/
│   ├── common/       # Reusable UI (Button, Input, Tag, CodeBlock, FollowButton, FollowStats, UserInfo, UserListItem, ThemeToggle)
│   ├── layout/       # Navbar, Sidebar, Layout, TopBar
│   ├── editor/       # MarkdownEditor, CodeMirrorEditor
│   ├── cards/        # PostCardFactory, SnippetCard, ArticleCard, MomentCard, PostCard
│   ├── feed/         # Feed, ComposeCard, EmptyState
│   ├── publish/      # PublishModal, SnippetEditor, ArticleEditor, MomentEditor, TagInput, RestoreDraftModal
│   ├── upload/       # ImageUploader
│   ├── profile/      # AvatarUpload
│   ├── comments/     # CommentSection, CommentItem
│   ├── notifications/ # NotificationItem, NotificationsPanel
│   └── ui/           # UI components (Card, Button, Input, PasswordModal, etc.)
├── hooks/            # useAuth, usePosts, useNotifications, useTheme
├── routes/           # TanStack Router definitions (index, login, search, profile, posts/$id, users/$userId.*, notifications)
├── services/         # Axios API client (notificationsService, etc.)
└── utils/            # draftStorage, privatePost
```

### Database Schema (10 tables)

- **Users**: id, username, password (encrypted), avatar_url
- **Posts**: id, type (SNIPPET/ARTICLE/MOMENT), title, content, language, summary, cover_image, is_private, password, user_id, created_at
- **Tags**: id, name, icon
- **Post_Tags**: post_id, tag_id (junction table)
- **Comments**: id, post_id, user_id, content, created_at, updated_at
- **CommentLikes**: id, user_id, comment_id, created_at
- **Bookmarks**: id, user_id, post_id, created_at
- **Follows**: follower_id, following_id, created_at
- **Likes**: id, user_id, post_id, created_at
- **Notifications**: id, user_id (recipient), actor_id (who performed action), type (LIKE/COMMENT/FOLLOW/MENTION), post_id, comment_id, is_read, created_at

### Core API Endpoints
```
# Authentication
POST /api/auth/login     # JWT authentication
POST /api/auth/register  # User registration

# Posts (CRUD + Search)
GET  /api/posts          # Feed (filterable by tag, type)
GET  /api/posts/{id}     # Get single post
POST /api/posts          # Publish content (type in JSON body)
PUT  /api/posts/{id}     # Update post (owner only)
DELETE /api/posts/{id}   # Delete post (owner only)
GET  /api/posts/search   # Search by keyword with optional type filter
POST /api/posts/{id}/verify-password # Verify password for private post

# Comments
GET  /api/posts/{postId}/comments  # Get post comments (paginated)
GET  /api/comments/{id}            # Get single comment
POST /api/posts/{postId}/comments  # Create comment
PUT  /api/comments/{id}            # Update comment (owner only)
DELETE /api/comments/{id}          # Delete comment (owner only)

# Likes
POST /api/likes/posts/{postId}     # Toggle like on post (like/unlike)
POST /api/comment-likes/{commentId} # Toggle like on comment (like/unlike)

# Bookmarks
GET  /api/bookmarks                # Get user bookmarks (paginated)
GET  /api/bookmarks/posts/{postId} # Check if post is bookmarked
GET  /api/bookmarks/posts/{postId}/count # Get bookmark count
POST /api/bookmarks/posts/{postId} # Add bookmark
DELETE /api/bookmarks/posts/{postId} # Remove bookmark

# Follows
GET  /api/follows/following        # Get following list (paginated)
GET  /api/follows/followers        # Get followers list (paginated)
GET  /api/follows/check/{userId}   # Check if following user
GET  /api/follows/counts/{userId}  # Get follower/following counts
POST /api/follows/{userId}         # Follow user
DELETE /api/follows/{userId}       # Unfollow user

# Notifications
GET  /api/notifications            # Get user notifications (paginated)
GET  /api/notifications/unread-count # Get unread notification count
POST /api/notifications/read/{id}  # Mark notification as read
POST /api/notifications/read-all   # Mark all notifications as read

# Users
GET  /api/users/{id}               # Get user by ID
GET  /api/users/username/{username} # Get user by username
GET  /api/users/{id}/posts         # Get user posts (paginated)
PUT  /api/users/profile            # Update current user profile

# Tags
GET  /api/tags                     # Popular topics for sidebar

# File Upload
POST /api/upload                   # Image upload → /static/uploads/{uuid}.png
```

## Key Implementation Details

### PostCardFactory Pattern
Frontend dynamically renders cards based on `post.type`:
- `SNIPPET`: Code display with syntax highlighting, copy button
- `ARTICLE`: Cover image + summary + title
- `MOMENT`: Large text, no title, Twitter-style

### Social Features
- **Comments**: Nested under posts, owner can edit/delete their comments, like/unlike comments
- **Likes**: Toggle like on posts and comments, real-time like count
- **Bookmarks**: Toggle bookmark on posts, separate bookmarks page
- **Follows**: Follow/unfollow users, view followers/following lists with stats
- **User Profiles**: Public profile pages with user info and posts
- **Notifications**: Real-time notifications for likes, comments, follows, and mentions with unread count badge

### Editor Features
- **Draft Auto-Save**: Automatically saves drafts to localStorage with 1-second debounce
- **CodeMirror Integration**: Advanced code editor with 20+ languages, syntax highlighting, line numbers
- **Fullscreen Mode**: All editors support fullscreen for focused writing
- **Markdown Toolbar**: Article editor has formatting buttons for common Markdown syntax
- **Character Counter**: Moment editor shows character count with visual progress bar
- **Image Upload**: Support for multiple images with preview

### Theme System
- **Three Modes**: Light, Dark, System (follows OS preference)
- **Persistence**: Theme preference saved to localStorage
- **Real-time Toggle**: Instant theme switching without page refresh
- **Tailwind Dark Mode**: Uses `dark:` prefix for conditional styling

### Private Posts
- **Password Protection**: Posts can be marked as private with optional password
- **Session-based Unlocking**: Unlocked posts stored in sessionStorage
- **Owner Access**: Post owners can always access their private posts
- **Visual Indicators**: Lock icons indicate private content

### Search
- Real-time search with debouncing (500ms)
- Searches post titles and content
- Optional type filter (Snippet/Article/Moment)
- URL-synced search state

### File Upload (MVP approach)
Configure in `application.properties`:
```properties
spring.web.resources.static-locations=file:./uploads/,classpath:/static/
```
Files saved to project root `uploads/` folder, accessible at `localhost:8080/filename.png`.

### Code Highlighting
- CodeMirror editor for snippet creation with 20+ language support
- ReactMarkdown + Shiki for displaying code in posts
- Language detection from post metadata
- Custom CodeBlock component with copy button

### UI Style
- Minimalist warm color palette (cream background, dark gray text, amber/orange accents)
- Dark mode with slate/gray tones for reduced eye strain
- Soft shadows (`shadow-sm` to `shadow-md`), rounded corners (`rounded-xl`)
- TanStack Router Loader for data pre-loading
- Responsive design with mobile-first approach

## Important Constraints

- This is an MVP demo - avoid production-level complexity (no message queues, caching, MinIO/OSS)
- Keep the implementation simple and focused on demonstrating the multi-type content model
- **Never** comment, unless it's useful
