#!/bin/bash

# Topset Docker Quick Start Script

set -e

echo "🏋️  Topset - Docker Setup"
echo "=========================="
echo ""

# Run from repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed."
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo "❌ Error: Docker Compose is not installed."
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed"
echo "✅ Docker Compose is installed"
echo ""

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Error: Docker daemon is not running."
    echo "Please start Docker Desktop or the Docker service."
    exit 1
fi

echo "✅ Docker daemon is running"
echo ""

# Check for existing .env file
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env from example..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "✅ backend/.env already exists"
fi

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Creating .env from example..."
        cp .env.example .env
        echo "✅ Created .env"
    fi
else
    echo "✅ .env already exists"
fi

echo ""
echo "🚀 Starting Docker containers..."
echo ""

# Build and start containers
docker compose up --build -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker compose ps | grep -q "Up"; then
    echo ""
    echo "✅ All services are running!"
    echo ""
    echo "📍 Access your application:"
    echo "   Frontend: http://localhost:5273"
    echo "   Backend:  http://localhost:8002"
    echo "   Health:   http://localhost:8002/health"
    echo ""
    echo "📊 View logs:"
    echo "   docker compose logs -f"
    echo ""
    echo "🛑 Stop services:"
    echo "   docker compose down"
    echo "   or: ./scripts/docker-stop.sh"
    echo ""
    echo "Happy lifting! 💪"
else
    echo ""
    echo "⚠️  Some services may not be running properly."
    echo "Check logs with: docker compose logs"
fi
