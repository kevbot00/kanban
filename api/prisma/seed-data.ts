import type { Prisma } from '../src/generated/prisma/client';

// Fixed id so the frontend and the e2e suite can reference a known board
export const SEEDED_BOARD_ID = '00000000-0000-0000-0000-000000000001';

export const SEED_BOARD = {
  id: SEEDED_BOARD_ID,
  slug: 'kanban-board',
  title: 'Kanban Board',
  columns: {
    create: [
      {
        title: 'To Do',
        position: 1000,
        cards: {
          create: [
            {
              title: 'Persist board to localStorage',
              description:
                'Persist the board state to localStorage so it is saved.',
              position: 1000,
            },
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
            {
              title: 'Build board, column, and card components',
              position: 1000,
            },
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
      { title: 'Backlog', position: 4000 },
    ],
  },
} satisfies Prisma.BoardCreateInput;
