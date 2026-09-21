FROM node:22.23.1-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY scripts ./scripts
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22.23.1-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./package.json
COPY --chown=node:node drizzle ./drizzle
USER node
HEALTHCHECK --interval=30s --timeout=7s --start-period=30s --retries=3 CMD ["node","dist/healthcheck.js"]
CMD ["node","dist/index.js"]
