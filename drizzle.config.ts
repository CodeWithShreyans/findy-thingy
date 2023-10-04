import { env } from "@/env.mjs"
import type { Config } from "drizzle-kit"

export default {
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    driver: "turso",
    dbCredentials: {
        url: env.DB_URL,
        authToken: env.DB_AUTH_TOKEN,
    },
} satisfies Config
