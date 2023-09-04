// import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
// import { nanoid } from "nanoid"

// const defaultFn = () => {
//     const id = nanoid(13)
//     console.log(id)

//     return id
// }

// export const index = sqliteTable("index", {
//     id: text("id")
//         .primaryKey()
//         .$default(() => defaultFn()),
//     imapId: text("imapId"),
//     gmailId: text("gmailId"),
//     from: text("from"),
//     date: integer("date"),
//     subject: text("subject"),
//     description: text("description"),
// })
