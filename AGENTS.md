# Repository Guidelines

## Project Structure & Module Organization
- Root: `client/` (React + TypeScript) and `server/` (Spring Boot). CI lives in `.github/workflows/`.
- Frontend: app code in `client/src/` (components/, routes/, hooks/, services/), public assets in `client/public/`, build output in `client/dist/`.
- Backend: Java sources in `server/src/main/java/`, resources in `server/src/main/resources/` (includes built frontend under `static/`), tests in `server/src/test/java/`.
- Nix: optional dev shell via `flake.nix` for JDK/Maven/Gradle.

## Build, Test, and Development Commands
- Backend (Maven Wrapper, JDK 17):
  - Dev run: `cd server && ./mvnw spring-boot:run`
  - Build jar: `./mvnw -B -ntp clean package`
  - Tests: `./mvnw test`
  - Lint: `./mvnw checkstyle:check`
- Frontend (Bun recommended; npm works too):
  - Install: `cd client && bun install` (or `npm install`)
  - Dev: `bun run dev` (Vite on :3000)
  - Test: `bun run test` (Vitest)
  - Lint/format: `bun run lint` / `bun run format`
  - Build: `bun run build` (assets later copied to `server/src/main/resources/static/`)
- Optional: `nix develop` to enter a shell with JDK/Maven/Gradle and Lombok agent.

## Coding Style & Naming Conventions
- Java (Checkstyle at `server/checkstyle.xml`):
  - 4-space indent, max line length 120, avoid `*` imports, one statement per line, methods ≤ 80 lines.
  - Standard naming rules enforced (types, methods, fields, params); prefer Lombok for boilerplate.
- TypeScript/React (Biome at `client/biome.json`):
  - Tabs for indentation; double quotes; organize imports; use function components and hooks.
  - File names: `PascalCase.tsx` for components, `useXxx.ts` for hooks, `kebab-case.ts` for utilities.

## Testing Guidelines
- Frontend: Vitest + Testing Library. Place specs as `*.test.ts(x)` near sources or under `client/src/__tests__/`. Run `bun run test`.
- Backend: Spring Boot tests under `server/src/test/java/`; name classes `*Tests`. Run `./mvnw test`. Start with service and controller smoke tests.

## Commit & Pull Request Guidelines
- Commits: use Conventional Commits seen in history (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `ci:`). Keep changes scoped and readable.
- PRs: include clear description, linked issues, test plan/steps, and screenshots for UI changes. Ensure CI passes (frontend lint/test/build, backend `mvn verify`).
- Before submitting: run `bun run lint && bun run test` in `client/` and `./mvnw verify` in `server/`.

## Security & Configuration Tips
- Backend config: `server/src/main/resources/application.properties` (H2 dev by default). For MySQL, update URL/credentials; keep JWT secrets in env vars. Uploads stored under `server/uploads/`.
- Frontend config: set `VITE_API_BASE_URL` and `VITE_STATIC_BASE_URL` for builds; default dev API is `http://localhost:8080/api`.

