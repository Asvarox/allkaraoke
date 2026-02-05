# Docker Setup for AllKaraoke

This directory contains Docker configuration files to build and run the AllKaraoke application in a containerized environment.

## Files

- `Dockerfile` - Main Docker image definition
- `.dockerignore` - Files to exclude from Docker build context
- `docker-build.sh` - Build script that reads Node version from .nvmrc
- `docker-compose.yml` - Docker Compose configuration for easy development

## Building the Docker Image

### Automatic Build (Recommended)

The build script automatically reads the Node version from `.nvmrc` file:

```bash
./docker-build.sh
```

### Manual Build

You can also build manually with a specific Node version:

```bash
# Build with Node version from .nvmrc (default: 20)
docker build --build-arg NODE_VERSION=20 -t allkaraoke:latest .

# Or build with a different Node version
docker build --build-arg NODE_VERSION=18 -t allkaraoke:latest .
```

## Running the Application

### Using Docker Run

```bash
# Run the container
docker run -p 3010:3010 allkaraoke:latest

# Run with custom environment variables
docker run -p 3010:3010 -e NODE_ENV=production allkaraoke:latest
```

### Using Docker Compose

```bash
# Start the application
docker-compose up

# Start in detached mode
docker-compose up -d

# Build and start
docker-compose up --build
```

## Configuration

### Environment Variables

You can set the Node version when building with Docker Compose:

```bash
NODE_VERSION=18 docker-compose up --build
```

### Port Configuration

The application runs on port 3010 inside the container. You can map it to a different host port:

```bash
docker run -p 8080:3010 allkaraoke:latest
```

## Development

For development, you might want to mount your source code as a volume:

```bash
docker run -p 3010:3010 -v $(pwd):/app -v /app/node_modules allkaraoke:latest
```

However, for active development, it's recommended to run the application directly using `pnpm start` as described in the main README.

## Health Check

The Docker image includes a health check that verifies the application is responding on port 3010. You can check the health status:

```bash
docker inspect --format='{{.State.Health.Status}}' <container_id>
```

## Build Options

The Docker build process:

1. Uses Node.js from the specified version (default: 20) on Alpine Linux
2. Installs pnpm package manager
3. Installs dependencies using `pnpm install --frozen-lockfile`
4. Builds the application using `FAST_BUILD=1 pnpm exec vite build`
5. Serves the built application using `pnpm start:production`

The `FAST_BUILD=1` environment variable is used to skip the pre-rendering step which requires Playwright browsers, making the Docker build faster and smaller.