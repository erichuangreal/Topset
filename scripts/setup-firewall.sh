#!/bin/bash

###############################################################################
# Firewall Setup Script for Topset on DigitalOcean
###############################################################################

set -e

echo ""
echo "🔥 Setting up firewall for Topset"
echo "=================================="
echo ""

# Check if ufw is installed
if ! command -v ufw &> /dev/null; then
    echo "❌ UFW is not installed. Installing..."
    apt-get update
    apt-get install -y ufw
fi

echo "Current firewall status:"
ufw status
echo ""

read -p "Configure firewall? This will allow SSH, port 5273 (frontend), and 8002 (backend). Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Firewall configuration cancelled"
    exit 1
fi

echo ""
echo "🔧 Configuring firewall rules..."

# Allow SSH (important - don't lock yourself out!)
echo "✅ Allowing SSH (port 22)"
ufw allow ssh

# Allow frontend
echo "✅ Allowing frontend (port 5273)"
ufw allow 5273/tcp

# Allow backend API
echo "✅ Allowing backend API (port 8002)"
ufw allow 8002/tcp

# Optional: Allow HTTP/HTTPS if you plan to use nginx reverse proxy
read -p "Also allow HTTP (80) and HTTPS (443)? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "✅ Allowing HTTP (port 80)"
    ufw allow 80/tcp
    echo "✅ Allowing HTTPS (port 443)"
    ufw allow 443/tcp
fi

# Set default policies
ufw default deny incoming
ufw default allow outgoing

# Enable firewall
echo ""
echo "🔥 Enabling firewall..."
ufw --force enable

echo ""
echo "✅ Firewall configured!"
echo ""
echo "Current firewall rules:"
ufw status verbose

echo ""
echo "📝 Summary:"
echo "  - SSH: Allowed"
echo "  - Frontend (5273): Allowed"
echo "  - Backend (8002): Allowed"
echo ""
echo "🌐 You can now access your app at:"
echo "  http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip'):5273"
echo ""
