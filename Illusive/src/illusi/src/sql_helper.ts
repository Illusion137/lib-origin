import * as SQLite from 'expo-sqlite';
import { is_empty } from "../../../../origin/src/utils/util";
import { Primitives, SQLTables } from "../../types";

export function sql_select<T extends Record<string, any>>(table: SQLTables, what: (keyof T) | "*"){
    return `SELECT ${String(what)} FROM ${table}`;
}
export function sql_select_count<T extends Record<string, any>>(table: SQLTables, what: (keyof T) | "*"){
    return `SELECT COUNT(${table}.${String(what)}) FROM ${table}`;
}
export function sql_insert(table: SQLTables){
    return `INSERT INTO ${table}`;
}
export function sql_insert_values<T extends Record<string, any>>(table: SQLTables, example_obj: T){
    const sql_table = obj_to_sql_table(undefined, example_obj, false);
    return `${sql_insert(table)} ${sql_table} values ${sql_table_to_query_variadics(sql_table)}`;
}
export function sql_where<T extends Record<string, any>>(...args: [keyof T, Primitives][]){
    return `WHERE ${args.map(arg => `${String(arg[0])}=${typeof arg[1] === "string" ? `'${arg[1]}'`: arg[1]}`).join(' AND ')}`;
}
export function sql_set<T extends Record<string, any>>(...args: [keyof T, Primitives][]){
    return `SET ${args.map(arg => `${String(arg[0])}=${typeof arg[1] === "string" ? `'${arg[1]}'`: arg[1]}'`).join(' AND ')}`;
}
export function sql_create_table<T extends Record<string, any>>(table: SQLTables, obj: T){
    return `CREATE TABLE IF NOT EXISTS ${table} ${obj_to_sql_table("id INTEGER PRIMARY KEY", obj, true)}`;
}
export function sql_delete_from(table: SQLTables){
    return `DELETE FROM ${table}`;
}
export function sql_drop_table(table: SQLTables){
    return `DROP table ${table}`;
}
export function sql_update_table(table: SQLTables){
    return `UPDATE ${table}`;
}

export function obj_to_sql_table(primary: string|undefined, obj: Record<string, any>, types: boolean){
    const key_values = is_empty(primary) ? [] : [primary];
    for(const key of Object.keys(obj)){
        if(types === true)
            switch(typeof obj[key]){
                case "object": key_values.push(`${key} STRING`); break;
                case "string": key_values.push(`${key} STRING`); break;
                case "number": key_values.push(`${key} INTEGER`); break;
                case "boolean": key_values.push(`${key} BOOLEAN`); break;
                default: break;
            }
        else if(typeof obj[key] !== "undefined") key_values.push(`${key}`);
    }
    return `(${key_values.join(", ")})`;
}
export function sql_table_to_query_variadics(sql_table: string){
    const qarr: string[] = [];
    for(const _ in sql_table.split(','))
        qarr.push('?');
    return `(${qarr.join(', ')})`;
}
export function obj_to_update_sql(obj: Record<string, any>){
    const updation: string[] = [];
    const keys = Object.keys(obj);
    for(const key of keys){
        const value = obj[key];
        switch(typeof value){
            case "string": updation.push(`${key}='${value}'`); break;
            case "object": updation.push(`${key}='${JSON.stringify(value)}'`); break;
            case "undefined": break;
            default: updation.push(`${key}=${value}`); break;
        }
    }
    return updation;
}

export async function sql_all(db: SQLite.SQLiteDatabase, ...args: string[]){
    return await db.getAllAsync(args.join(" "));
}