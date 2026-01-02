# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build the static site
RUN pnpm build

# Production stage - serve with nginx
FROM nginx:alpine AS production

# Security: Remove default nginx config and unnecessary files
RUN rm -rf /etc/nginx/conf.d/default.conf \
    && rm -rf /usr/share/nginx/html/* \
    && rm -rf /var/cache/nginx/* \
    && rm -rf /var/log/nginx/*

# Security: Create non-root user for nginx
RUN addgroup -g 1001 -S appgroup \
    && adduser -u 1001 -S appuser -G appgroup \
    && chown -R appuser:appgroup /var/cache/nginx \
    && chown -R appuser:appgroup /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown -R appuser:appgroup /var/run/nginx.pid

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder --chown=appuser:appgroup /app/dist /usr/share/nginx/html

# Security: Make files read-only where possible
RUN chmod -R 755 /usr/share/nginx/html \
    && chmod 644 /etc/nginx/conf.d/default.conf

# Expose port 8080 (non-privileged)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Security: Run as non-root user
USER appuser

CMD ["nginx", "-g", "daemon off;"]
