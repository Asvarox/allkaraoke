#!/bin/bash

# Demo script showing Docker usage for AllKaraoke
# This script demonstrates how the Docker setup works

echo "=== AllKaraoke Docker Setup Demo ==="
echo

# Check Node version from .nvmrc
if [ -f ".nvmrc" ]; then
    NODE_VERSION=$(cat .nvmrc)
    echo "📋 Node version from .nvmrc: $NODE_VERSION"
else
    echo "❌ .nvmrc file not found"
    exit 1
fi

echo "📦 Available Docker commands:"
echo

echo "1. Build Docker image with automatic Node version detection:"
echo "   ./docker-build.sh"
echo

echo "2. Build with specific Node version:"
echo "   docker build --build-arg NODE_VERSION=$NODE_VERSION -t allkaraoke:latest ."
echo

echo "3. Run the container:"
echo "   docker run -p 3010:3010 allkaraoke:latest"
echo

echo "4. Use Docker Compose:"
echo "   docker-compose up"
echo

echo "5. Use Docker Compose with specific Node version:"
echo "   NODE_VERSION=$NODE_VERSION docker-compose up --build"
echo

echo "🚀 The application will be available at: http://localhost:3010"
echo

echo "📚 For detailed instructions, see DOCKER.md"
echo

# Show what the build process does
echo "=== Build Process Overview ==="
echo "1. 🐳 Starts with node:$NODE_VERSION-alpine base image"
echo "2. 📦 Installs pnpm package manager"
echo "3. 📥 Copies package.json and pnpm-lock.yaml"
echo "4. ⬇️  Installs dependencies with pnpm install --frozen-lockfile"
echo "5. 📁 Copies source code"
echo "6. 🔨 Builds app with FAST_BUILD=1 pnpm exec vite build"
echo "7. 🚀 Starts production server with pnpm start:production"
echo "8. 🌐 Exposes port 3010"
echo

echo "✅ Docker setup complete and ready to use!"