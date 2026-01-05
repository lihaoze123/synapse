# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-05

### First Stable Release

Synapse v0.1.0 is the first stable release of the topic-based content aggregation platform.

### Added

#### Core Features
- User authentication with JWT tokens
- Multi-type content publishing (Snippet, Article, Moment)
- Tag/topic system for content categorization
- Real-time search with debouncing
- Smart pagination with infinite scroll

#### Social Features
- Comment system with nested replies
- Like/unlike for posts and comments
- Bookmark functionality for personal collection
- Follow system (follow/unfollow users)
- User profiles with public pages
- Real-time notifications via WebSocket

#### Content Enhancement
- MinIO S3-compatible object storage
- Multi-file attachment support
- Image upload for avatars and covers
- CodeMirror editor with 20+ language syntax highlighting
- Responsive mobile-first design
- Auto-save drafts to localStorage
- Dark mode (Light/Dark/System preference)
- Password-protected private posts

#### Infrastructure
- Redis caching layer (optional, demo profile)
- Prometheus metrics collection
- Grafana dashboards (demo profile)
- Swagger/OpenAPI 3.0 API documentation (dev profile)
- Docker multi-stage builds
- Health checks for all services

#### Security
- BCrypt password hashing
- Lazy password migration
- JWT-based stateless authentication
- Configurable CORS settings

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, TanStack Query + Router |
| Backend | Spring Boot 3.2, Spring Data JPA |
| Database | MySQL 8.0 / H2 (demo) |
| Cache | Redis (optional) |
| Storage | MinIO S3-compatible |
| Monitoring | Prometheus + Grafana |

### Documentation
- Comprehensive README.md with deployment guides
- API documentation via Swagger UI
- Project documentation in CLAUDE.md

### Testing
- Backend: 179 unit tests (JUnit 5)
- Frontend: 446 tests (Vitest + Testing Library)

---

## [0.0.8] - 2026-01-02

### Added
- Swagger API documentation
- MinIO object storage support
- BCrypt password hashing with lazy migration

## [0.0.7] - 2026-01-02

### Added
- Frontend UI/UX optimizations

## [0.0.6] - 2026-01-02

### Added
- WebSocket support for real-time notifications

## [0.0.5] - 2026-01-01

### Added
- Prometheus and Grafana monitoring stack

## [0.0.4] - 2026-01-01

### Added
- Redis caching for improved performance

## [0.0.3] - 2025-12-31

### Added
- Unit tests for service and util layers

## [0.0.2] - 2025-12-31

### Added
- Initial project structure

## [0.0.1] - 2025-12-31

### Added
- Project initialization
