# ── Build stage ──
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/game-engine/package.json packages/game-engine/
COPY apps/server/package.json apps/server/
COPY tsconfig.base.json ./

RUN npm ci --workspace=packages/game-engine --workspace=apps/server

COPY packages/game-engine/ packages/game-engine/
COPY apps/server/ apps/server/

RUN npm run build --workspace=packages/game-engine
RUN npm run build --workspace=apps/server

# ── Runtime stage ──
FROM node:20-alpine AS runtime
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/package.json /app/package-lock.json* ./
COPY --from=build /app/packages/game-engine/package.json packages/game-engine/
COPY --from=build /app/packages/game-engine/dist/ packages/game-engine/dist/
COPY --from=build /app/apps/server/package.json apps/server/
COPY --from=build /app/apps/server/dist/ apps/server/dist/

RUN npm ci --omit=dev --workspace=packages/game-engine --workspace=apps/server

USER app
EXPOSE 3000
CMD ["node", "apps/server/dist/index.js"]
