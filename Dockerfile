# === Stage 1: Build ===
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for building)
RUN npm ci

# Copy full project (including tsconfig files and src)
COPY . .

# Build the NestJS application
RUN npx nest build


# === Stage 2: Production ===
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy only package files to install prod deps
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001 \
  && chown -R nestjs:nodejs /app

USER nestjs

# Expose app port
EXPOSE 3000

# Health check endpoint (adjust if needed)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run the app
CMD ["node", "dist/main"]
