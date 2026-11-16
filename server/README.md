# Brev.ly API

Fastify API using PostgreSQL and Drizzle ORM.

## Local development

1. Copy .env.example to .env and set DATABASE_URL.
2. Install dependencies with pnpm install.
3. Start the local PostgreSQL database with docker compose up -d db.
4. Apply the database migrations with pnpm db:migrate.
5. Start the API with pnpm dev.

The API listens on port 3333 by default. Set CORS_ORIGIN to the frontend origin; multiple origins may be comma-separated.
The Compose database uses postgres/postgres credentials, exposes port 5432, and stores its data in the named brevly-postgres-data volume.

## Routes

- POST /urls — create a link using originalUrl and shortUrl.
- GET /urls — list links, newest first.
- DELETE /urls/:id — delete by UUID.
- GET /urls/:slug — increment accesses and return the original URL.
- GET /urls/export — upload a CSV report to Cloudflare R2 and redirect to its public URL.
- GET /health — process health check.

CSV export requires the Cloudflare R2 variables from .env.example. The bucket's public URL must be enabled and its CORS policy must permit downloads from the frontend origin because the browser follows the export redirect.

## Database

Run pnpm db:generate after changing src/db/schema.ts to generate a migration, then apply it with pnpm db:migrate.

## Container

Build from the server directory with docker build -t brevly-server . Pass environment variables at runtime and run pnpm db:migrate as a deployment migration step before starting the container.
