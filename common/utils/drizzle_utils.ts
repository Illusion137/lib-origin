import type { DB, Scalar } from "@op-engineering/op-sqlite";
import { generror_catch } from "./error_util";
function is_error_failed_unique_contraint(error: unknown) {
    return (error as Error).message.includes("UNIQUE constraint failed")
}
function log_error_if_not_unique_constraint_failed(error: unknown, source: string, what: string) {
    if (!is_error_failed_unique_contraint(error)) {
        console.error(generror_catch(error, `DB failed to ${what}`, "MEDIUM", { source }));
        console.error(`SQL: ${source}`);
    }
}
export class DrizzleUtils<SQLTables extends string> {
    db: DB;
    constructor(db: DB) {
        this.db = db;
    }

    get_all_sync_dz<TQuery extends PromiseLike<any[]> & { toSQL: () => { sql: string; params: unknown[] } }>(query: TQuery): Awaited<TQuery> {
        const { sql, params } = query.toSQL();
        try {
            return (this.db.executeSync(sql, params as Scalar[])).rows as unknown as Awaited<TQuery>;
        } catch (error) {
            log_error_if_not_unique_constraint_failed(error, sql, "get all SYNC DZ");
            return [] as unknown as Awaited<TQuery>;
        }
    }

    async exec_async(source: string) {
        try {
            await this.db.execute(source);
        } catch (error) {
            log_error_if_not_unique_constraint_failed(error, source, "execute async");
        }
    }

    async run_async(source: string, params?: Scalar[]) {
        try {
            if (params !== undefined)
                await this.db.execute(source, params);
            else await this.db.execute(source);
        } catch (error) {
            log_error_if_not_unique_constraint_failed(error, source, "run async");
        }
    }

    get_all_sync<T>(source: string, ...params: Scalar[]): T[] {
        try {
            return (this.db.executeSync(source, params)).rows as unknown as T[];
        } catch (error) {
            log_error_if_not_unique_constraint_failed(error, source, "get all SYNC");
            return [];
        }
    }
    async get_all_async<T>(source: string, ...params: Scalar[]): Promise<T[]> {
        try {
            return (await this.db.executeWithHostObjects(source, params)).rows as unknown as T[];
        } catch (error) {
            log_error_if_not_unique_constraint_failed(error, source, "get all async");
            return [];
        }
    }

    async get_all_triggers() {
        return await this.get_all_async<{ name: string }>("select name from sqlite_master where type = 'trigger';");
    }

    async delete_all_triggers() {
        const triggers = await this.get_all_triggers();
        await this.db.transaction(async () => {
            for (const trigger of triggers) {
                await this.exec_async(`DROP TRIGGER IF EXISTS ${trigger.name};`);
            }
        });
    }

    async create_timestamp_trigger_if_not_exists(table: SQLTables) {
        const triggers = await this.get_all_triggers();
        if (triggers.map(trigger => trigger.name).includes(`${table}_on_create_trigger`)) return;
        await this.exec_async(`
            CREATE TRIGGER IF NOT EXISTS ${table}_on_create_trigger
            AFTER INSERT ON ${table}
            BEGIN
            UPDATE ${table} SET created_at = strftime('%s', 'now') WHERE id = NEW.id;
            END;

            CREATE TRIGGER IF NOT EXISTS ${table}_on_modified_trigger
            AFTER UPDATE On ${table}
            BEGIN
                UPDATE ${table} SET modified_at = strftime('%s', 'now') WHERE id = NEW.id;
            END;   
        `);
    }

    // TODO get the only item in the deleted_table and use that as the only key to delete the shiznick
    async create_on_delete_trigger_if_not_exists<T extends Record<string, any>>(watch_table: SQLTables, copy_table: SQLTables, obj: T) {
        const triggers = await this.get_all_async<{ name: string }>("SELECT name from sqlite_master WHERE type = 'trigger';");
        if (triggers.map(trigger => trigger.name).includes(`${watch_table}_deleted_Trigger`)) return;
        const keys = Object.keys(obj).filter(key => obj[key] !== undefined);
        await this.exec_async(`
            CREATE TRIGGER IF NOT EXISTS ${watch_table}_deleted_Trigger
            BEFORE DELETE ON ${watch_table}
            FOR EACH ROW
            BEGIN
                INSERT INTO ${copy_table} (${keys.join(', ')}) VALUES (${keys.map(key => `OLD.${key}`).join(', ')});
            END;
        `);
    }

    // async get_all_changes(last_synced_at: number): Promise<Record<SQLTables, string[]>>{
    //     return reinterpret_cast<Record<SQLTables, string[]>>({});
    // }
}