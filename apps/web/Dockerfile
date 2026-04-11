# ── Build stage ──
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/game-engine/package.json packages/game-engine/
COPY apps/web/package.json apps/web/
COPY tsconfig.base.json ./

RUN npm ci --workspace=packages/game-engine --workspace=apps/web

COPY packages/game-engine/ packages/game-engine/
COPY apps/web/ apps/web/

RUN npm run build --workspace=packages/game-engine
RUN npm run build --workspace=apps/web

# ── Serve stage ──
FROM nginx:alpine AS runtime

COPY --from=build /app/apps/web/dist/ /usr/share/nginx/html/
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
