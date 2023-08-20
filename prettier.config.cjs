/** @type {import("prettier").Config} */
const config = {
    plugins: [
        require.resolve("prettier-plugin-tailwindcss"),
        require.resolve("@ianvs/prettier-plugin-sort-imports"),
    ],
    tabWidth: 4,
    semi: false,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    importOrder: [
        "^(react/(.*)$)|^(react$)",
        "^(next/(.*)$)|^(next$)",
        "<THIRD_PARTY_MODULES>",
        "",
        "^types$",
        "^@local/(.*)$",
        "^@/pages/(.*)$",
        "^@/config/(.*)$",
        "^@/lib/(.*)$",
        "^@/components/(.*)$",
        "^@/assets/(.*)$",
        "^@/styles/(.*)$",
        "^[./]",
    ],
    importOrderSeparation: false,
    importOrderSortSpecifiers: true,
    importOrderBuiltinModulesToTop: true,
    importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
    importOrderMergeDuplicateImports: true,
    importOrderCombineTypeAndValueImports: true,
}

module.exports = config
