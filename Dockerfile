# ============================================================
# Relic Hunter - Multi-stage Docker Build
# Builds the Vite/Phaser.js game, then serves via nginx
# Deploy on Synology NAS at *.dukestack.com
# ============================================================

# ----------------------------------------------------------
# Stage 1: Build the static assets with Node
# ----------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching.
# npm ci will only re-run when these files change, not on every
# source code edit.
COPY package.json package-lock.json ./

# Use npm ci for deterministic, reproducible installs
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build production-optimized static files into dist/
RUN npm run build

# ----------------------------------------------------------
# Stage 2: Serve with nginx (tiny production image)
# ----------------------------------------------------------
FROM nginx:alpine AS production

# Remove the default nginx site
RUN rm -rf /usr/share/nginx/html/*

# Copy the built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# nginx listens on port 80 inside the container
EXPOSE 80

# nginx runs in the foreground (default CMD from nginx:alpine)
CMD ["nginx", "-g", "daemon off;"]
