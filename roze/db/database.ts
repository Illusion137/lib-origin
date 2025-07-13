import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import { novels_table } from './schema';

const opsqliteDb = open({
    name: 'db',
});

const db = drizzle(opsqliteDb);