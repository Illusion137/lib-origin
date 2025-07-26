import type { SQLite } from "@native/sqlite/sqlite.base";

import { open } from '@op-engineering/op-sqlite';
import { novels_table } from "@roze/db/schema";
import { drizzle } from 'drizzle-orm/op-sqlite';

const opsqliteDb = open({
    name: 'db',
});

const db = drizzle(opsqliteDb);
export const mobile_sqlite: SQLite = {
    create_database_handle: () => drizzle()
};

mobile_sqlite.select().from(novels_table).execute().then(c => c).catch(e => e)