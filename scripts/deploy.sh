#!/bin/bash

###############################################################################
# Simple Deployment Script for Topset on DigitalOcean (or any VPS)
###############################################################################
#
# This script deploys the app in the current directory.
# Run this on your droplet after cloning the project.
#
# Usage:
#   1. Clone project: git clone <repo> topset
#   2. cd topset
#   3. ./scripts/deploy.sh
#
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo "🚀 Deploying Topset App"
echo "======================="
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker first: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not available"
    exit 1
fi

echo "✅ Docker is available"
echo ""

# Generate secure passwords
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24)
MYSQL_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24)

# Create backend .env file
echo "📝 Creating backend/.env file..."
cat > backend/.env << EOF
DATABASE_URL="mysql://lifting_app:${MYSQL_PASSWORD}@db:3306/lifting"
PORT=8002
NODE_ENV=production
EOF

echo "✅ Backend .env created"
echo ""

# Create docker-compose.prod.yml with generated credentials
echo "📝 Creating docker-compose.prod.yml..."
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  # MySQL Database
  db:
    image: mysql:8.0
    container_name: topset-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: lifting
      MYSQL_USER: lifting_app
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "127.0.0.1:3406:3306"  # Only accessible from localhost
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: topset-backend
    restart: unless-stopped
    environment:
      DATABASE_URL: mysql://lifting_app:${MYSQL_PASSWORD}@db:3306/lifting
      PORT: 8002
      NODE_ENV: production
    ports:
      - "8002:8002"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app-network

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=http://localhost:8002
    container_name: topset-frontend
    restart: unless-stopped
    ports:
      - "5273:80"
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  mysql_data:

networks:
  app-network:
    driver: bridge
EOF

echo "✅ docker-compose.prod.yml created"
echo ""

# Save credentials
echo "💾 Saving credentials..."
cat > .credentials << EOF
# Topset Database Credentials
# Created: $(date)
# Keep this file secure!

MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_USER=lifting_app
MYSQL_PASSWORD=${MYSQL_PASSWORD}
DATABASE_URL=mysql://lifting_app:${MYSQL_PASSWORD}@db:3306/lifting
EOF
chmod 600 .credentials

echo "✅ Credentials saved to .credentials"
echo ""

# Stop existing containers if running
echo "🛑 Stopping existing containers (if any)..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
echo ""

# Build and start
echo "🔨 Building and starting containers..."
echo "This may take a few minutes on first run..."
echo ""
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check status
echo ""
echo "📊 Container Status:"
docker compose -f docker-compose.prod.yml ps
echo ""

# Test backend health
echo "🏥 Checking backend health..."
if curl -s http://localhost:8002/health | grep -q "ok"; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend might still be starting up..."
fi
echo ""

# Get server IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")

# Success message
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║            ✅ Deployment Successful! 🎉                ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Your app is now running!${NC}"
echo ""
echo -e "${BLUE}Access your application:${NC}"
echo "  Frontend: http://${SERVER_IP}:5273"
echo "  Backend:  http://${SERVER_IP}:8002"
echo "  Health:   http://${SERVER_IP}:8002/health"
echo ""
echo -e "${YELLOW}Management Commands:${NC}"
echo "  View logs:    docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop:         docker compose -f docker-compose.prod.yml down"
echo "  Restart:      docker compose -f docker-compose.prod.yml restart"
echo "  Rebuild:      docker compose -f docker-compose.prod.yml up -d --build"
echo ""
echo -e "${YELLOW}Database credentials saved in: .credentials${NC}"
echo "Keep this file secure!"
echo ""
