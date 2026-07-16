// better-sqlite3-node25 is an npm alias of better-sqlite3@12 used only by tests
// (the runtime ^9 dep has no native binding for the local node ABI).
declare module "better-sqlite3-node25" {
    import Database from "better-sqlite3";
    export = Database;
}
