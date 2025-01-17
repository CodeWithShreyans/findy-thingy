/** @type {import("eslint").Linter.Config} */
const config = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: true,
    },
    plugins: ["@typescript-eslint"],
    extends: [
        "next/core-web-vitals",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
    ],
    ignorePatterns: ["/src/components/ui/*.tsx"],
    rules: {
        "no-console": ["warn"],
        "@typescript-eslint/consistent-type-imports": [
            "warn",
            {
                prefer: "type-imports",
                fixStyle: "inline-type-imports",
            },
        ],
        "@typescript-eslint/no-unused-vars": [
            "warn",
            { argsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/ban-ts-comment": ["warn"],
        "@typescript-eslint/array-type": [
            "warn",
            {
                default: "array-simple",
            },
        ],
    },
    settings: {
        tailwindcss: {
            callees: ["twmerge", "clsx", "cn"],
        },
    },
}

module.exports = config
