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
| Code/Text | react-syntax-highlighter (code highlighting), react-markdown |
| Lint/Format | Biome (frontend), Checkstyle (backend) |
| Testing | Vitest + Testing Library (frontend), JUnit 5 (backend) |
| Backend | Spring Boot 3.2, Spring Data JPA (Hibernate) |
| Database | MySQL (production) / H2 (demo) |
| Auth | JWT (jjwt library) |
| File Storage | Local `uploads/` folder with UUID naming |

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
npm install

# Development
npm run dev      # Dev server at http://localhost:3000

# Build
npm run build    # Production build

# Test (Vitest)
npm run test

# Lint & Format (Biome)
npm run lint     # Check for lint errors
npm run format   # Check formatting
npm run check    # Lint + format combined
```

## Architecture

### Backend Package Structure
```
com.synapse/
├── config/        # CORS, StaticResourceConfig
├── controller/    # AuthController, PostController, TagController
├── dto/           # PostRequest, LoginRequest
├── entity/        # User, Post, Tag (JPA Entities)
├── repository/    # JPA Repository interfaces
├── service/       # Business logic
└── utils/         # JWTUtil, FileUtil
```

### Frontend Structure
```
src/
├── components/
│   ├── common/    # Reusable UI (Button, Input)
│   ├── layout/    # Navbar, Sidebar
│   ├── editor/    # MarkdownEditor, CodeEditor
│   └── cards/     # PostCardFactory, SnippetCard, ArticleCard, MomentCard
├── hooks/         # useAuth, usePosts
├── routes/        # TanStack Router definitions
├── services/      # Axios API client
└── utils/
```

### Database Schema (4 tables)

- **Users**: id, username, password (encrypted), avatar_url
- **Posts**: id, type (SNIPPET/ARTICLE/MOMENT), title, content, language, summary, cover_image, user_id, created_at
- **Tags**: id, name, icon
- **Post_Tags**: post_id, tag_id (junction table)

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

# Tags
GET  /api/tags           # Popular topics for sidebar

# Users
GET  /api/users/profile  # Get current user profile
PUT  /api/users/profile  # Update profile

# File Upload
POST /api/upload         # Image upload → /static/uploads/{uuid}.png
```

## Key Implementation Details

### PostCardFactory Pattern
Frontend dynamically renders cards based on `post.type`:
- `SNIPPET`: Code display with syntax highlighting, copy button
- `ARTICLE`: Cover image + summary + title
- `MOMENT`: Large text, no title, Twitter-style

### File Upload (MVP approach)
Configure in `application.properties`:
```properties
spring.web.resources.static-locations=file:./uploads/,classpath:/static/
```
Files saved to project root `uploads/` folder, accessible at `localhost:8080/filename.png`.

### UI Style
- Minimalist warm color palette (cream background, dark gray text, amber/orange accents)
- Soft shadows (`shadow-sm` to `shadow-md`), rounded corners (`rounded-xl`)
- TanStack Router Loader for data pre-loading

## Important Constraints

- This is an MVP demo - avoid production-level complexity (no message queues, caching, MinIO/OSS)
- Keep the implementation simple and focused on demonstrating the multi-type content model
