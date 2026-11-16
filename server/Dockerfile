FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY tsconfig.json drizzle.config.ts ./
COPY src ./src
COPY drizzle ./drizzle
RUN pnpm build

FROM base AS production-dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/src/db/schema.ts ./src/db/schema.ts
COPY package.json ./package.json
USER node
EXPOSE 3333
CMD ["node", "dist/server.js"]
