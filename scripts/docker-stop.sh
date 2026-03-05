#!/bin/bash

# Topset Docker Stop Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "🛑 Stopping Topset Docker containers..."
echo ""

docker compose down

echo ""
echo "✅ All containers stopped!"
echo ""
echo "💡 To remove all data (including database):"
echo "   docker compose down -v"
echo ""
echo "🚀 To start again:"
echo "   ./scripts/docker-start.sh"
echo "   or: docker compose up -d"
