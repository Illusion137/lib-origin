import { defineConfig } from 'drizzle-kit';
export default defineConfig({
    dialect: 'sqlite',
    schema: './illusive/src/db/schema.ts',
    out: './illusive/src/drizzle-desktop',
    dbCredentials: {
        url: "C:\\Users\\raygo\\.illusi\\sumi.sqlite"
    }
});