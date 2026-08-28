import { migrateTestDb } from './support/db';

export default function globalSetup() {
  migrateTestDb();
}
