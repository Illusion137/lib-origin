import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';

const opsqliteDb = open({
    name: 'db',
});

const db = drizzle(opsqliteDb); 
db;