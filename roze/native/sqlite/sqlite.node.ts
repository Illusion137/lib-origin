import type { SQLite } from "@native/sqlite/sqlite.base";

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const sqlite = new Database('sqlite.db');
const db = drizzle({ client: sqlite });

export const node_sqlite: SQLite = db;
