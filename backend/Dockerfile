# @CODE:TAG-DEPLOY-DOCKER-001
# Multi-stage build for backend production container

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:20-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy installed dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY . .

# Change ownership to node user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "server.js"]

# Labels for maintenance
LABEL maintainer="cyans" \
      version="1.0.0" \
      description="Todo Backend API" \
      org.opencontainers.image.source="https://github.com/cyans/todo-app"