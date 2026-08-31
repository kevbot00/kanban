# Kanban

A Trello style kanban board with drag-and-drop, built as a full-stack TypeScript monorepo.

Cards can be dragged within or across columns, with support for creating cards and updating descriptions.

**Stack:** React 19 · Vite · Tailwind CSS v4 · dnd-kit · TanStack Query · NestJS · Prisma · PostgreSQL · Playwright

```
web/   React frontend
api/   NestJS API, Prisma schema and migrations
e2e/   Playwright tests
```

## Getting started

Requires Node 24+ (see `.nvmrc`) and Docker.

```bash
npm install
docker compose up -d
```

Create `api/.env`:

```
DATABASE_URL="postgresql://kanban:kanban@localhost:5432/kanban?schema=public"
```

Migrate and seed:

```bash
cd api
npx prisma migrate deploy
npx prisma db seed
```

Start both servers:

```bash
npm run dev
```

Web on http://localhost:5173, API on http://localhost:3000/api, Swagger at http://localhost:3000/api/swagger.

## Tests

```bash
npm run test:e2e
npm run test:e2e:ui
```

Playwright starts its own servers on ports 3001 and 5174 against a separate `kanban_test` database, so a running `npm run dev` is never disturbed. Each test resets the database first.