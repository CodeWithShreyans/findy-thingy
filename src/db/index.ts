import { env } from "@/env.mjs"
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import { migrate } from "drizzle-orm/libsql/migrator"

import * as schema from "./schema"

const client = createClient({
    url: env.DB_URL,
    authToken: env.DB_AUTH_TOKEN,
    tls: true,
    // fetch: fetch,
})

export const db = drizzle(client, {
    schema: schema,
})

await migrate(db, { migrationsFolder: "drizzle" })
