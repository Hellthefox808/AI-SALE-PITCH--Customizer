# ==============================================================================
# PitchCraft AI — Enterprise Production Multi-Stage Dockerfile
# Security Hardened: Non-Root Execution • Alpine Base • Zero Vulnerability Surface
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:22-alpine AS frontend-builder
WORKDIR /build/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Install Production Backend Dependencies
FROM node:22-alpine AS backend-deps
WORKDIR /build/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

# Stage 3: Final Production Runtime Container
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000 \
    DB_PATH=/app/data/sales_pitch.db

# Install curl/ca-certificates if needed and prepare app permissions
RUN apk --no-cache add ca-certificates && \
    mkdir -p /app/data /app/backend /app/frontend && \
    chown -R node:node /app

# Copy production backend dependencies and source code
COPY --chown=node:node --from=backend-deps /build/backend/node_modules /app/backend/node_modules
COPY --chown=node:node backend/package.json /app/backend/package.json
COPY --chown=node:node backend/src /app/backend/src

# Copy built frontend client assets
COPY --chown=node:node --from=frontend-builder /build/frontend/dist /app/frontend/dist

# Switch to unprivileged non-root user
USER node

# Expose internal API & Web service port
EXPOSE 4000

# Continuous Liveness Probe Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/api/health/live').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start Enterprise Production Server
CMD ["node", "backend/src/server.js"]
