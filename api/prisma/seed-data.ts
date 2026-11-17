import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Prisma } from '../src/generated/prisma/client';

type SeedCard = { title: string; description?: string; position: number };
type SeedColumn = { title: string; position: number; cards?: SeedCard[] };
type SeedData = {
  id: string;
  slug: string;
  title: string;
  columns: SeedColumn[];
};

const seed: SeedData = JSON.parse(
  readFileSync(join(__dirname, 'seed-data.json'), 'utf8'),
);

export const SEEDED_BOARD_ID = seed.id;

export const SEED_BOARD = {
  id: seed.id,
  slug: seed.slug,
  title: seed.title,
  columns: {
    create: seed.columns.map(({ cards = [], ...column }) => ({
      ...column,
      cards: { create: cards },
    })),
  },
} satisfies Prisma.BoardCreateInput;
