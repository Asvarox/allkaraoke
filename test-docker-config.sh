#!/bin/bash

# Test script to validate Docker configuration files

echo "=== Docker Configuration Test ==="

# Check if required files exist
echo "Checking required files..."

files=("Dockerfile" ".dockerignore" "docker-build.sh" "docker-compose.yml" "DOCKER.md")
all_files_exist=true

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file missing"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    echo "Some required files are missing!"
    exit 1
fi

# Check if .nvmrc file exists and read Node version
echo ""
echo "Checking Node version configuration..."
if [ -f ".nvmrc" ]; then
    NODE_VERSION=$(cat .nvmrc)
    echo "✓ .nvmrc exists with Node version: $NODE_VERSION"
else
    echo "✗ .nvmrc file not found"
    exit 1
fi

# Validate Dockerfile syntax (basic check)
echo ""
echo "Validating Dockerfile..."
if grep -q "FROM node:" Dockerfile; then
    echo "✓ Dockerfile uses Node base image"
else
    echo "✗ Dockerfile doesn't use Node base image"
    exit 1
fi

if grep -q "ARG NODE_VERSION" Dockerfile; then
    echo "✓ Dockerfile supports NODE_VERSION argument"
else
    echo "✗ Dockerfile doesn't support NODE_VERSION argument"
    exit 1
fi

if grep -q "pnpm install" Dockerfile; then
    echo "✓ Dockerfile uses pnpm for dependency installation"
else
    echo "✗ Dockerfile doesn't use pnpm"
    exit 1
fi

if grep -q "vite build" Dockerfile; then
    echo "✓ Dockerfile builds the application"
else
    echo "✗ Dockerfile doesn't build the application"
    exit 1
fi

if grep -q "start:production" Dockerfile; then
    echo "✓ Dockerfile starts the production server"
else
    echo "✗ Dockerfile doesn't start the production server"
    exit 1
fi

# Check .dockerignore
echo ""
echo "Validating .dockerignore..."
if grep -q "node_modules" .dockerignore; then
    echo "✓ .dockerignore excludes node_modules"
else
    echo "✗ .dockerignore doesn't exclude node_modules"
    exit 1
fi

if grep -q "build/" .dockerignore; then
    echo "✓ .dockerignore excludes build directory"
else
    echo "✗ .dockerignore doesn't exclude build directory"
    exit 1
fi

# Check docker-compose.yml
echo ""
echo "Validating docker-compose.yml..."
if grep -q "NODE_VERSION" docker-compose.yml; then
    echo "✓ docker-compose.yml supports NODE_VERSION variable"
else
    echo "✗ docker-compose.yml doesn't support NODE_VERSION variable"
    exit 1
fi

if grep -q "3010:3010" docker-compose.yml; then
    echo "✓ docker-compose.yml exposes port 3010"
else
    echo "✗ docker-compose.yml doesn't expose port 3010"
    exit 1
fi

# Check build script
echo ""
echo "Validating build script..."
if [ -x "docker-build.sh" ]; then
    echo "✓ docker-build.sh is executable"
else
    echo "✗ docker-build.sh is not executable"
    chmod +x docker-build.sh
    echo "  Fixed: Made docker-build.sh executable"
fi

if grep -q "cat .nvmrc" docker-build.sh; then
    echo "✓ Build script reads Node version from .nvmrc"
else
    echo "✗ Build script doesn't read from .nvmrc"
    exit 1
fi

echo ""
echo "=== All Docker configuration tests passed! ==="
echo ""
echo "To build and run the Docker image:"
echo "1. Run: ./docker-build.sh"
echo "2. Run: docker run -p 3010:3010 allkaraoke:latest"
echo "3. Or use: docker-compose up"
echo ""
echo "The application will be available at http://localhost:3010"