import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.board.deleteMany();

  await prisma.board.create({
    data: {
      // Fixed id so the frontend and Playwright can reference a known board.
      id: '00000000-0000-0000-0000-000000000001',
      slug: 'kanban-board',
      title: 'Kanban Board',
      columns: {
        create: [
          {
            title: 'To Do',
            position: 1000,
            cards: {
              create: [
                { title: 'Persist board to localStorage', position: 1000 },
                { title: 'Write Playwright drag test', position: 2000 },
                { title: 'Deploy to AWS', position: 3000 },
              ],
            },
          },
          {
            title: 'In Progress',
            position: 2000,
            cards: {
              create: [
                { title: 'Build board, column, and card components', position: 1000 },
                { title: 'Wire up dnd-kit sensors', position: 2000 },
              ],
            },
          },
          {
            title: 'Done',
            position: 3000,
            cards: {
              create: [
                { title: 'Scaffold Vite + React + TypeScript', position: 1000 },
                { title: 'Add Tailwind', position: 2000 },
              ],
            },
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
