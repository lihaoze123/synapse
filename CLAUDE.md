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
| Frontend | React 19, Vite 7, Tailwind CSS 4, Coss UI, TanStack Query + Router + AI |
| Real-time | WebSocket (Spring WebSocket + react-use-websocket) |
| Code/Text | CodeMirror (code editor with syntax highlighting), react-markdown |
| Lint/Format | Biome (frontend), Checkstyle (backend) |
| Testing | Vitest + Testing Library (frontend), JUnit 5 (backend) |
| Backend | Spring Boot 3.2, Spring Data JPA (Hibernate) |
| Database | MySQL (production) / H2 (demo) |
| Cache | Redis (optional, for demo profile) |
| Monitoring | Prometheus + Grafana (demo profile) |
| Auth | JWT (jjwt library), BCrypt password hashing |
| File Storage | MinIO S3-compatible object storage |
| API Docs | Swagger/OpenAPI 3.0 (springdoc-openapi) |
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
├── config/           # Configuration classes
│   ├── CorsConfig.java
│   ├── FilterConfig.java
│   ├── JwtAuthenticationFilter.java
│   ├── MinioConfig.java           # MinIO S3-compatible storage
│   ├── OpenApiConfig.java        # Swagger/OpenAPI documentation
│   ├── RedisConfig.java
│   ├── SpaFallbackController.java
│   ├── StaticResourceConfig.java
│   ├── WebSocketConfig.java
│   └── JwtConfig.java (legacy)
├── controller/       # REST API endpoints
│   ├── AuthController.java
│   ├── OAuth2Controller.java
│   ├── PostController.java
│   ├── CommentController.java
│   ├── UserController.java
│   ├── LikeController.java
│   ├── CommentLikeController.java
│   ├── BookmarkController.java
│   ├── FollowController.java
│   ├── NotificationController.java
│   ├── FileController.java
│   └── TagController.java
├── dto/              # Request/Response DTOs (ApiResponse, PostDto, CommentDto, NotificationDto, VerifyPasswordRequest, etc.)
├── entity/           # JPA Entities (11 total)
├── repository/       # JPA Repository interfaces
├── service/          # Business logic layer
├── util/             # Utility classes (JwtUtil, FileUtil)
├── utils/            # Additional utilities
└── websocket/        # WebSocket handlers (NotificationWebSocketHandler, JwtHandshakeInterceptor, NotificationBroadcaster)
```

### Frontend Structure
```
src/
├── components/
│   ├── common/       # Reusable UI (Button, Input, Tag, CodeBlock, FollowButton, FollowStats, UserInfo, UserListItem, ThemeToggle, Avatar, EmojiPicker)
│   ├── layout/       # Navbar, Sidebar, Layout, TopBar, BottomNav
│   ├── editor/       # MarkdownEditor, CodeMirrorEditor, EmojiPicker
│   ├── cards/        # PostCardFactory, SnippetCard, ArticleCard, MomentCard, PostCard
│   ├── feed/         # Feed, ComposeCard, EmptyState
│   ├── publish/      # PublishModal, SnippetEditor, ArticleEditor, MomentEditor, TagInput, RestoreDraftModal
│   ├── upload/       # ImageUploader, FileUploader, AttachmentList
│   ├── profile/      # AvatarUpload
│   ├── comments/     # CommentSection, CommentItem
│   ├── notifications/ # NotificationItem, NotificationsPanel
│   ├── ai/           # AI features (AIAssistantToolbar, PostAIActions, AIPreviewModal)
│   ├── settings/     # Settings page components
│   ├── auth/         # OAuth2Button, Login forms
│   └── ui/           # UI components (Card, Button, Input, PasswordModal, Sheet, Tooltip, Skeleton, ConfirmDialog)
├── hooks/            # useAuth, usePosts, useNotifications, useNotificationRealtime, useTheme, useAI, useAIPreview
├── routes/           # TanStack Router definitions (index, login, search, profile, posts/$id, users/$userId.*, notifications, settings, bookmarks)
├── services/         # Axios API client (notificationsService, aiService, authService, etc.)
└── utils/            # draftStorage, privatePost
```

### Database Schema (11 tables)

- **Users**: id, username, password (BCrypt encrypted), avatar_url, display_name, bio
- **Posts**: id, type (SNIPPET/ARTICLE/MOMENT), title, content, language, summary, cover_image, is_private, password, user_id, created_at
- **Tags**: id, name, icon
- **Post_Tags**: post_id, tag_id (junction table)
- **Comments**: id, post_id, user_id, content, floor (comment number), created_at, updated_at
- **CommentLikes**: id, user_id, comment_id, created_at
- **Bookmarks**: id, user_id, post_id, created_at
- **Follows**: follower_id, following_id, created_at
- **Likes**: id, user_id, post_id, created_at
- **Notifications**: id, user_id (recipient), actor_id (who performed action), type (LIKE/COMMENT/FOLLOW/MENTION), post_id, comment_id, is_read, created_at
- **Attachments**: id, post_id, file_name, file_url, file_size, mime_type, created_at

### Core API Endpoints
```
# Authentication
POST /api/auth/login     # JWT authentication
POST /api/auth/register  # User registration
GET  /api/oauth2/authorize        # OAuth2 authorization
GET  /api/oauth2/callback/{provider}  # OAuth2 callback (GitHub, Google)

# AI (optional, requires OpenAI API key)
POST /api/ai/chat        # AI chat completion endpoint

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
PUT  /api/users/profile            # Update current user profile (display_name, bio, avatar)
PUT  /api/users/avatar             # Update avatar image

# Tags
GET  /api/tags                     # Popular topics for sidebar

# File Upload
POST /api/upload                   # Image upload → MinIO object storage

# Swagger UI
GET  /swagger-ui.html             # Interactive API documentation (dev profile)

# WebSocket
WS   /api/ws/notifications?token=xxx  # Real-time notifications (JWT in query param)
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
- **Bookmarks**: Toggle bookmark on posts, dedicated bookmarks page with pagination
- **Follows**: Follow/unfollow users, view followers/following lists with stats
- **User Profiles**: Public profile pages with user info and posts
- **Settings**: User settings page for profile management (display name, bio, avatar)
- **Notifications**: Real-time notifications for likes, comments, follows, and mentions with unread count badge

### Real-time Features
- **WebSocket Notifications**: Push-based real-time notifications via `/api/ws/notifications`
- **JWT Handshake Auth**: WebSocket connection authenticated via JWT token in query parameter
- **Auto Reconnect**: Frontend automatically reconnects on connection drop
- **Message Types**: `unreadCount` (updates badge), `notification` (invalidates list query)

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

### AI Features
- **TanStack AI Integration**: Uses OpenAI-compatible API for AI features
- **AI Actions**:
  - **Improve**: Rewrite and enhance text content
  - **Summarize**: Generate concise summaries
  - **Explain Code**: Analyze and explain code snippets
- **AI Preview Modal**: Preview AI-generated content before applying to post
- **AI Assistant Toolbar**: Quick access to AI actions in editors (consolidated dropdown)
- **SSE Streaming**: Server-Sent Events for real-time AI responses
- **Thread Management**: Request tracking with unique chat IDs
- **Timeout Handling**: 60-second timeout for AI requests
- **Chinese Localization**: AI prompts and responses in Chinese
- **Environment-based**: Requires `OPENAI_API_KEY` and `OPENAI_BASE_URL` to enable

### OAuth2 Authentication
- **Supported Providers**: GitHub, Google
- **Spring Security OAuth2**: Standard OAuth2 client implementation
- **JWT Integration**: OAuth2 login issues JWT tokens for API access
- **Enhanced Login UI**: OAuth2 buttons with provider icons and loading states

### File Upload (MinIO S3-compatible Storage)
Files are stored in MinIO object storage with the following features:
- **S3-compatible API**: Uses minio-java SDK for storage operations
- **Public read policy**: Uploaded files are publicly accessible via MinIO
- **UUID naming**: Files are renamed with UUID to prevent conflicts
- **Multiple file support**: Posts can have multiple file attachments
- **File types**: Support for PDF, Word, Excel, PowerPoint, archives, images
- **File icons**: Visual indicators based on MIME type
- **Progress tracking**: Upload progress indicators for multiple files
- **Environment-based configuration**: Supports external MinIO for production

Configure via environment variables:
```bash
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=synapse-uploads
```

For development/demo with Docker, MinIO is included in the demo profile.

### Caching
- **Spring Cache + Redis**: Optional caching layer for improved performance
- **Cache Categories**:
  - `posts`: 10 min TTL - Full post data with user and tags
  - `users`: 15 min TTL - User profiles by ID or username
  - `tags`: 30 min TTL - Popular and all tags lists
  - `comments`: 10 min TTL - Individual comment data
  - `counts`: 5 min TTL - Likes, bookmarks, followers, unread notifications
- **HTTP Caching**: Static resources cached (uploads: 7 days, assets: 1 year)
- **Graceful Degradation**: App works without Redis, just without caching benefits
- **Docker Demo**: Use `docker-compose --profile demo up` to enable Redis

### Monitoring
- **Prometheus**: Metrics collection on port 9090 (demo profile)
- **Grafana**: Visualization dashboards on port 3001 (demo profile)
- **Micrometer Integration**: Spring Boot Actuator metrics exposed to Prometheus
- **Custom Business Metrics**:
  - `synapse.users.total` - Total registered users
  - `synapse.posts.total` - Total posts (with `type` tag breakdown)
  - `synapse.posts.private` - Private post count
  - `synapse.comments.total` - Total comments
  - `synapse.likes.total` - Total post likes
  - `synapse.comment_likes.total` - Total comment likes
  - `synapse.bookmarks.total` - Total bookmarks
  - `synapse.follows.total` - Total follow relationships
  - `synapse.notifications.total` - Total notifications (with `type` tag)
  - `synapse.notifications.unread` - Unread notification count
  - `synapse.tags.total` - Total tags
- **Infrastructure Metrics**: MySQL and Redis exporters for database monitoring
- **Pre-built Dashboards**: Spring Boot, MySQL, Redis, and Synapse business metrics

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

### Enhanced UI Components
- **Toast Notifications**: Using `sonner` library with success/error/info/warning variants
- **Emoji Picker**: `@emoji-mart` integration for adding emojis to posts and comments
- **Form Components**: Reusable form, label, field components with validation
- **Avatar**: Avatar component with upload support and fallback initials
- **Sheet/Drawer**: Side panel component for mobile menus and settings
- **Tooltip**: Hover tooltips for additional context
- **Skeleton**: Loading placeholders for content loading states
- **Confirm Dialog**: Modal for confirming destructive actions

### Mobile Features
- **Bottom Navigation**: Mobile-optimized bottom navigation bar
- **Mobile Action Bar**: Context-aware action buttons for mobile
- **Responsive Layout**: Mobile-first design with breakpoints

### Animation System
- **Framer Motion**: Smooth page transitions and element animations
- **Stagger Effects**: Sequential animation for lists and cards
- **Page Transitions**: Animated navigation between routes

### Error Handling
- **Error Boundary**: Prevents app crashes from unhandled errors
- **Graceful Degradation**: App continues working when optional services fail

### Image Features
- **Blur Placeholder**: Progressive image loading with blur effect
- **Image Preview Modal**: Full-size image viewing
- **Lazy Loading**: Images load as needed for performance

## Important Constraints

- This is a course project demonstrating multi-type content aggregation
- Keep the implementation simple and focused on core functionality
- **Never** comment, unless it's useful
