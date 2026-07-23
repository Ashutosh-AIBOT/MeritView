FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

FROM base AS deps
COPY backend/package.json ./backend/package.json
RUN pnpm install --frozen-lockfile --filter meritview-backend...

FROM base AS builder
COPY --from=deps /app ./
COPY backend/ ./
RUN pnpm --filter meritview-backend prisma:generate
RUN pnpm --filter meritview-backend build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -S meritview && adduser -S meritview -G meritview
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/package.json ./package.json
USER meritview
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/v1/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"
CMD ["node", "dist/index.js"]
