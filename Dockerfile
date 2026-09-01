# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Rewrite path aliases in compiled output
RUN npx tsc-alias

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 discordbot

# Copy built assets from builder (with rewritten imports)
COPY --from=builder --chown=discordbot:nodejs /app/dist ./dist
COPY --from=builder --chown=discordbot:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=discordbot:nodejs /app/package.json ./package.json

USER discordbot

# Health check - uses HTTP endpoint instead of Discord WebSocket
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

CMD ["node", "dist/index.js"]