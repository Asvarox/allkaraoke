#!/bin/bash

# Build script for AllKaraoke Docker image
# Reads Node version from .nvmrc file

# Read Node version from .nvmrc file
if [ -f ".nvmrc" ]; then
    NODE_VERSION=$(cat .nvmrc)
    echo "Using Node version from .nvmrc: $NODE_VERSION"
else
    NODE_VERSION="20"
    echo "No .nvmrc file found, using default Node version: $NODE_VERSION"
fi

# Build the Docker image with the specified Node version
echo "Building Docker image with Node $NODE_VERSION..."
docker build --build-arg NODE_VERSION=$NODE_VERSION -t allkaraoke:latest .

echo "Build complete! You can run the image with:"
echo "docker run -p 3010:3010 allkaraoke:latest"