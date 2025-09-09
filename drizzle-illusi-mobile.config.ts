import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    dialect: 'sqlite',
    driver: 'expo',
    schema: './illusive/src/db/schema.ts',
    out: './illusive/src/drizzle-mobile',
});