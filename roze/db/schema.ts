import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { RozSourceFileTypeArray, type RozChapterContents } from "@roze/types/roz";

export const novels_table = sqliteTable("novels_table", {
    id: int().primaryKey({ autoIncrement: true }),
    uuid: text().notNull().unique(),
    source_file: text().notNull(),
    source_file_type: text({enum: RozSourceFileTypeArray}).notNull(),
    title: text().notNull(),
    cover: text().default(""),
    author: text().default(""),
    publisher: text().default(""),
    date: text().default(new Date(0).toISOString()),
    series_name: text().default(""),
    series_no: int().default(0),
    content: text({mode: 'json'}).$type<RozChapterContents[]>().notNull(),
});
// export type AssertRozTableMatches = StaticAssert<TypesAreEqual<typeof novels_table.$inferSelect, SQLRoz>>;

export const series_table = sqliteTable("series_table", {
    id: int().primaryKey({ autoIncrement: true }),
    uuid: text().notNull().unique(),
    title: text().default(""),
    author: text().default(""),
    source_type: text({enum: RozSourceFileTypeArray}).notNull().default("FILEBASE"),
});
export type SeriesTableItem = typeof series_table.$inferSelect;

export const series_novel_table = sqliteTable("series_novel_table", {
    id: int().primaryKey({ autoIncrement: true }),
    series_uuid: text().notNull(),
    novel_uuid: text().notNull()
});
export type SeriesNovelTableItem = typeof series_novel_table.$inferSelect;