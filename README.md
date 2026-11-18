# Kanban

[![CI](https://github.com/kevbot00/kanban/actions/workflows/ci.yml/badge.svg)](https://github.com/kevbot00/kanban/actions/workflows/ci.yml)

A Trello style kanban board with drag-and-drop, built as a full-stack TypeScript monorepo.

Cards can be dragged within or across columns, with support for creating cards and updating descriptions.

**Stack:** React 19 · Vite · Tailwind CSS v4 · dnd-kit · TanStack Query · NestJS · Prisma · PostgreSQL

**Tests:** Playwright · pytest · httpx · Selenium · Allure

```
web/     React frontend
api/     NestJS API, Prisma schema and migrations
e2e/     TypeScript Playwright tests
e2e-py/  Python API, Playwright and Selenium tests
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

There's also a Python suite in `e2e-py/` with API tests and a few UI tests in Playwright and Selenium. It uses its own `kanban_test_py` database and ports 3002/5175. Setup is in [TESTING.md](TESTING.md#running), then:

```bash
cd e2e-py
.venv/bin/pytest
npx allure@3.33.0 open allure-results
```

CI also uploads the Allure report as an artifact on each [run](https://github.com/kevbot00/kanban/actions/workflows/ci.yml?query=branch%3Amain).

See [TESTING.md](TESTING.md) for the test strategy, the flaky and weak tests that were found and fixed, and known gaps.