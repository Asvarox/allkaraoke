# Dockerfile for AllKaraoke
# Uses Node version from .nvmrc file (default: 20)

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.6

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
ENV FAST_BUILD=1
RUN pnpm exec vite build

# Expose port
EXPOSE 3010

# Start the application
CMD ["pnpm", "start:production"]