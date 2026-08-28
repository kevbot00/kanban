export const API_PORT = 3001;
export const WEB_PORT = 5174;

export const API_URL = `http://localhost:${API_PORT}`;
export const WEB_URL = `http://localhost:${WEB_PORT}`;

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://kanban:kanban@localhost:5432/kanban_test?schema=public';

export { SEEDED_BOARD_ID } from '../../api/prisma/seed-data';
