import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { TEST_DATABASE_URL } from './config';
import { PrismaClient } from '../../api/src/generated/prisma/client';
import { SEED_BOARD } from '../../api/prisma/seed-data';

const apiDir = resolve(__dirname, '../../api');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: TEST_DATABASE_URL }),
});

const runPrisma = (args: string[]) => {
  execFileSync('npx', ['prisma', ...args], {
    cwd: apiDir,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });
};

export const migrateTestDb = () => runPrisma(['migrate', 'deploy']);

export const resetTestDb = async () => {
  await prisma.board.deleteMany();
  await prisma.board.create({ data: SEED_BOARD });
};
