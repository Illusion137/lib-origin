import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["**/*.{ts}"] },
    { languageOptions: { globals: globals.node } },
    { ignores: [
        "babel.config.js", 
        "eslint.config.mjs", 
        "jest.config.js",
        "origin/src/youtube_dl/PATCH/sax/sax.js",
        "origin/src/manga_reader/deob.js",
        "origin/src/manga_reader/deob2.js",
    ]},
    pluginJs.configs.recommended,
    // ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            "@typescript-eslint/only-throw-error": "error",
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-require-imports": "off",
            "no-useless-escape": "off",
            "no-empty": "off",
            "no-prototype-builtins": "off",
            "no-setter-return": "off",
            "@typescript-eslint/no-this-alias": "off",
            "no-misleading-character-class": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-argument": "off", // TURN THIS ON
            "@typescript-eslint/require-await": "off",
            "@typescript-eslint/restrict-template-expressions": "off"
        }
    }
];