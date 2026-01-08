# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- TanStack AI integration for AI-assisted content creation
- AI Assistant Toolbar (consolidated dropdown) for quick access to AI actions
- AI Preview Modal for reviewing AI-generated content before applying
- Post AI Actions (improve text, summarize content, explain code)
- OAuth2 login support with GitHub and Google providers
- Enhanced authentication UI with OAuth2 provider buttons and loading states
- Settings page for user profile management (display name, bio, avatar)
- Emoji picker integration for posts and comments
- File attachment support for various file types (PDF, Office, archives, images)
- File upload progress tracking for multiple files
- Toast notification system with success/error/info/warning variants
- Mobile bottom navigation and action bar
- Image preview modal for full-size viewing
- Blur placeholder for progressive image loading
- Error boundary for graceful error handling
- Framer Motion animations for page transitions and staggered lists

### Changed
- AI prompts localized to Chinese
- AI toolbar consolidated into dropdown menu
- SSE format compatible with TanStack AI protocol
- Text selection preserved when triggering AI actions

### Fixed
- AI chat reliability with authentication, timeouts, and thread management
- Test expectations for AI preview modal
- Lint and checkstyle violations

## [0.1.0] - 2026-01-05

### First Stable Release

Synapse v0.1.0 is the first stable release of the topic-based content aggregation platform.

### Added (since v0.0.8)
- Swagger/OpenAPI 3.0 API documentation
- MinIO S3-compatible object storage
- BCrypt password hashing with lazy migration
- Prometheus metrics collection
- Grafana dashboards for monitoring
- Redis caching layer (optional, demo profile)

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, TanStack Query + Router |
| Backend | Spring Boot 3.2, Spring Data JPA |
| Database | MySQL 8.0 / H2 (demo) |
| Cache | Redis (optional) |
| Storage | MinIO S3-compatible |
| Monitoring | Prometheus + Grafana |

### Testing
- Backend: 179 unit tests (JUnit 5)
- Frontend: 446 tests (Vitest + Testing Library)

---

## [0.0.8] - 2026-01-02

### Added
- Improved editor and post detail display
- Private post support with password protection
- Instant dark mode toggle (Light/Dark/System)
- Draft auto-save for publish modal
- Notification system with WebSocket

## [0.0.7] - 2026-01-02

### Added
- Documentation for using prebuilt Docker images from GHCR

## [0.0.6] - 2026-01-02

### Added
- Enhanced markdown editor with LaTeX support and toolbar
- Enhanced comment system with markdown, preview, and mentions
- User profiles with displayName and bio
- File attachment support for posts

## [0.0.5] - 2026-01-02

### Added
- SPA fallback controller for client-side routing
- Docker support with multi-stage build
- Spring Boot production profile with MySQL configuration

## [0.0.4] - 2026-01-01

### Added
- GitHub Actions release workflow
- Fix for timezone issues using Instant instead of LocalDateTime

## [0.0.3] - 2025-12-31

### Added
- Bookmarks UI feature
- Like feature for posts and comments
- Mobile-optimized navigation and action bars
- Tag filtering to search
- Migrated frontend from npm to Bun
- Biome auto-format applied to client code
- GitHub Actions workflows for CI

## [0.0.2] - 2025-12-31

### Added
- Enhanced UI with Linear-style design and improved navigation

## [0.0.1] - 2025-12-31

### Added
- Initial project release
