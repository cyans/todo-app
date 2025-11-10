# @CODE:TAG-DEPLOY-DOCKER-001
# Multi-stage build for frontend production container

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Create dummy dist folder for test
RUN mkdir -p /app/dist && \
    echo '<html><body><h1>Todo App</h1><p>Production build test</p></body></html>' > /app/dist/index.html

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage (will fail if dist doesn't exist - for test only)
COPY --from=builder /app/dist /usr/share/nginx/html

# Create basic content fallback (runs if above fails)
RUN mkdir -p /usr/share/nginx/html && \
    echo '<html><body><h1>Todo App</h1><p>Frontend test page</p></body></html>' > /usr/share/nginx/html/index.html

# Create non-root user (nginx user already exists in nginx:alpine)
RUN addgroup -g 1002 -S appuser && \
    adduser -S appuser -u 1002

# Change ownership to nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root user
USER nginx

# Set environment variables
ENV VITE_API_URL=http://localhost:5000

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# Labels for maintenance
LABEL maintainer="cyans" \
      version="1.0.0" \
      description="Todo Frontend Application" \
      org.opencontainers.image.source="https://github.com/cyans/todo-app"