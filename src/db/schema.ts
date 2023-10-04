import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { nanoid } from "nanoid"

export const main = sqliteTable("main", {
    id: text("id")
        .primaryKey()
        .$default(() => nanoid(13)),
    userId: text("user_id"),
    imapId: text("imap_id").unique(),
    gmailId: text("gmail_id").unique(),
    from: text("from"),
    date: integer("date"),
    subject: text("subject"),
    description: text("description"),
})
