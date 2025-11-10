#!/bin/bash

# @CODE:UI-UX-DEPLOY-005:DEPLOY-INFRA
# Production deployment script for Todo Application

set -e  # Exit on any error

# Configuration
COMPOSE_FILE="docker-compose.yml"
PROD_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
LOG_FILE="deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

error_exit() {
    echo -e "${RED}ERROR: $1${NC}" | tee -a $LOG_FILE
    exit 1
}

success() {
    echo -e "${GREEN}SUCCESS: $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}WARNING: $1${NC}" | tee -a $LOG_FILE
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error_exit "Docker is not installed or not in PATH"
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error_exit "Docker Compose is not installed or not in PATH"
    fi

    # Check if compose files exist
    if [ ! -f "$COMPOSE_FILE" ]; then
        error_exit "Docker Compose file $COMPOSE_FILE not found"
    fi

    success "Prerequisites check completed"
}

# Environment setup
setup_environment() {
    log "Setting up environment..."

    # Set production environment
    export NODE_ENV=production
    export COMPOSE_PROJECT_NAME=todo-app-prod

    # Load environment variables if file exists
    if [ -f "$ENV_FILE" ]; then
        log "Loading environment variables from $ENV_FILE"
        export $(cat $ENV_FILE | grep -v '^#' | xargs)
    else
        warning "Environment file $ENV_FILE not found, using defaults"
    fi

    success "Environment setup completed"
}

# Cleanup previous deployment
cleanup() {
    log "Cleaning up previous deployment..."

    # Stop and remove existing containers
    if docker-compose ps | grep -q "Up"; then
        log "Stopping existing containers..."
        docker-compose down || true
    fi

    # Remove dangling images
    docker image prune -f || true

    success "Cleanup completed"
}

# Build and deploy
deploy() {
    log "Starting deployment..."

    # Pull latest images
    log "Pulling latest images..."
    docker-compose pull || warning "Failed to pull some images"

    # Build new images
    log "Building application images..."
    docker-compose build --no-cache

    # Start services
    log "Starting services..."
    docker-compose up -d --build

    success "Deployment completed"
}

# Health check
health_check() {
    log "Performing health checks..."

    # Wait for services to start
    sleep 30

    # Check backend health
    log "Checking backend health..."
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        success "Backend health check passed"
    else
        error_exit "Backend health check failed"
    fi

    # Check frontend health
    log "Checking frontend health..."
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "Frontend health check passed"
    else
        error_exit "Frontend health check failed"
    fi

    success "All health checks passed"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    docker-compose down
    error_exit "Deployment failed, rollback completed"
}

# Main execution
main() {
    log "Starting Todo App deployment process..."

    # Trap errors and call rollback
    trap 'rollback' ERR

    check_prerequisites
    setup_environment
    cleanup
    deploy
    health_check

    success "Deployment completed successfully!"
    log "Application is running at http://localhost:3000"
    log "API is available at http://localhost:5000"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "cleanup")
        cleanup
        ;;
    "health")
        health_check
        ;;
    "rollback")
        rollback
        ;;
    *)
        echo "Usage: $0 {deploy|cleanup|health|rollback}"
        exit 1
        ;;
esac