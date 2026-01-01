# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/client

RUN npm install -g bun

COPY client/package.json client/bun.lock* ./
RUN bun install --frozen-lockfile

COPY client/ ./
RUN VITE_API_BASE_URL=/api VITE_STATIC_BASE_URL= bun run build

# Stage 2: Build backend
FROM eclipse-temurin:17-jdk-alpine AS backend-build
WORKDIR /app

COPY server/.mvn .mvn
COPY server/mvnw server/pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY server/src src

COPY --from=frontend-build /app/client/dist src/main/resources/static

RUN ./mvnw package -DskipTests -B

# Stage 3: Runtime
FROM eclipse-temurin:17-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -g 1001 synapse && \
    adduser -u 1001 -G synapse -D synapse && \
    mkdir -p /app/uploads && \
    chown -R synapse:synapse /app

COPY --from=backend-build --chown=synapse:synapse /app/target/*.jar app.jar

USER synapse

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:8080/api/tags || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
