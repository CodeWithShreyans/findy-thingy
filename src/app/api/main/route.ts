import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/db"
import { main } from "@/db/schema"
// import { db } from "@/db"
// import { index } from "@/db/schema"
import { env } from "@/env.mjs"
import { auth, clerkClient } from "@clerk/nextjs"
import {
    type SignedInAuthObject,
    type SignedOutAuthObject,
} from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { google } from "googleapis"
import { simpleParser, type ParsedMail } from "mailparser"
import OpenAI from "openai"
import { kv } from "upstash-kv"
import { z } from "zod"

interface ParsedMessage {
    mail: ParsedMail
    imapId?: string
    gmailId?: string
}

// const openImap = async () => {
//     const imapClient = new ImapFlow({
//         host: "imap.gmail.com",
//         port: 993,
//         secure: true,
//         auth: {
//             user: "shreyansthebest2007@gmail.com",
//             pass: "hgjfxmnuxjfvwkbk",
//         },
//     })
//     await imapClient.connect()
//     const lock = await imapClient.getMailboxLock("INBOX")

//     return {
//         imapClient,
//         [Symbol.dispose]() {
//             lock.release()
//             imapClient.close()
//         },
//     }
// }

// const imapFetch = async () => {
//     using imap = await openImap()

//     const {imapClient} = imap

//     // 25470, 25832
//     const messages = imapClient.fetch("25807:*", {
//         source: true,
//         uid: true,
//     })

//     // console.log(
//     //     data.headers.toString(),
//     //     data.internalDate,
//     //     data.bodyStructure,
//     //     data.envelope,
//     //     data.bodyParts.get("1")?.toString(),
//     // )

//     const parsedMessages: ParsedMessage[] = []
//     for await (const msg of messages) {
//         const parsed = await simpleParser(msg.source)
//         parsedMessages.push({ mail: parsed, imapId: String(msg.uid) })
//     }

//     return { messages: parsedMessages }
// }

const alreadyIndexed = await db.query.main.findMany({
    where: eq(main.userId, "user_2UZLBlyilBNuHhU6foi8aGbVq9r"),
    columns: {
        userId: false,
        date: false,
        description: false,
        from: false,
        id: false,
        imapId: false,
        subject: false,
    },
})

const gmailFetch = async (clerk: SignedInAuthObject | SignedOutAuthObject) => {
    console.time("auth")

    const oauthToken = await clerkClient.users.getUserOauthAccessToken(
        clerk.userId!,
        "oauth_google",
    )
    console.timeEnd("auth")

    console.time("fetch")
    const list = await google.gmail("v1").users.messages.list({
        userId: "me",
        oauth_token: oauthToken?.[0]?.token,
        maxResults: 200,
        q: "in:inbox from:support@buildspace.so",
    })
    console.timeEnd("fetch")

    const messages: ParsedMessage[] = []
    for (const message of list.data.messages!) {
        if (alreadyIndexed.find((v) => message.id === v.gmailId)) continue
        console.time("msg" + message.id)
        const msg = (
            await google.gmail("v1").users.messages.get({
                userId: "me",
                id: message.id ?? undefined,
                oauth_token: oauthToken?.[0]?.token,
                format: "raw",
            })
        ).data.raw!

    const messages = (await Promise.allSettled(
        emailPromises as unknown[],
    )) as Array<
        PromiseSettledResult<
            Array<{
                data: { raw: string }
            }>
        >
    >

    // const messages: ParsedMessage[] = []
    // for (const message of list.data.messages!) {
    //     console.time("msg" + message.id)
    const msg = (
        await google.gmail("v1").users.messages.get({
            userId: "me",
            id: message.id ?? undefined,
            oauth_token: oauthToken?.[0]?.token,
            format: "raw",
        })
    ).data.raw

    //     console.timeEnd("msg" + message.id)
    //     console.time("parse" + message.id)
    //     const parsed = await simpleParser(Buffer.from(msg, "base64url"))
    //     console.timeEnd("parse" + message.id)
    //     messages.push({
    //         mail: parsed,
    //         gmailId: message.id!,
    //     })
    // }

    return { messages }
}

const openAI = async (parsed: ParsedMail) => {
    const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
        fetch: fetch,
    })

    console.log("hello", parsed.from?.text)

    if (parsed.text === undefined) return "NO TEXT"

    const content = `From: ${parsed.from?.text}\nTo: ${
        parsed.to instanceof Array
            ? parsed.to.flatMap((item) => item.text).join(", ")
            : parsed.to?.text
    }\nSubject: ${
        parsed.subject
    }\nDate: ${parsed.date?.toDateString()}\nBody:\n${parsed.text}`
    console.log(content.length)

    if (content.length > 7000) return "MESSAGE TOO LONG"

    const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: await kv.get<string>("prompt"),
            },
            {
                role: "user",
                content: content,
                // content: parsed.text!,
            },
        ],
    })

    console.log(res.choices[0]?.message.content)

    return res.choices[0]?.message.content
}

// const writeToDB = (
//     source: "imap" | "gmail",
//     parsed: ParsedMail,
//     desc: string,
//     imapId?: string,
// ) => {
//     const writeRes = db
//         .insert(index)
//         .values({
//             imapId: source === "imap" ? imapId : null,
//             gmailId: source === "gmail" ? "TODO" : null,
//             from: parsed.from?.text,
//             date: parsed.date?.getTime(),
//             subject: parsed.subject,
//             description: desc,
//         })
//         .run()

//     console.log(writeRes)

//     return writeRes
// }

export const GET = async () => {
    // let imap = null
    // if (env.NODE_ENV !== "production") imap = req.nextUrl.searchParams.get("imap")
    // const gmail = req.nextUrl.searchParams.get("gmail")

    // let messages: ParsedMessage[]

    // const { messages } = imap
    //     ? await imapFetch()
    //     : gmail
    //     ? await gmailFetch()
    //     : { messages: null }

    const clerk = auth()

    const { messages } = await gmailFetch(clerk)

    // if (!messages) {
    //     return new Response("Email fetch method not chosen", { status: 400 })
    // }

    const res: Array<{ subject: string; desc: string }> = []

    console.time("gpt")
    for (const msg of messages) {
        if (alreadyIndexed.find((v) => msg.gmailId === v.gmailId)) continue
        const desc = await openAI(msg.mail)
        if (
            desc === "MESSAGE TOO LONG" ||
            desc === "NO TEXT" ||
            desc === null ||
            desc === undefined
        )
            continue
        // writeToDB("imap", msg.mail, desc, msg.imapId ?? msg.gmailId)
        res.push({ subject: msg.mail.subject!, desc: desc })
        await db
            .insert(main)
            .values({
                userId: clerk.userId,
                imapId: msg.imapId,
                gmailId: msg.gmailId,
                from: msg.mail.from?.text,
                date: msg.mail.date?.getTime(),
                subject: msg.mail.subject,
                description: desc,
            })
            .onConflictDoNothing()
    }
    console.timeEnd("gpt")

    console.log("res", res)

    return new Response(JSON.stringify(res))
}

export const POST = async (req: NextRequest) => {
    const res = await req.formData()

    const email = res.get("email")

    if (email) {
        if (!z.string().email().safeParse(email).success) {
            return new Response(null, {
                status: 400,
                statusText: "Invalid email",
            })
        }
        await kv.lrem("emails", 0, email?.toString())
        await kv.rpush("emails", email?.toString())
    }

    const file = res.get("file")

    if ((!file || (file instanceof Blob && file.size === 0)) && email) {
        return new Response(
            JSON.stringify([
                { subject: "Thanks for signing up to the waitlist!", desc: "" },
            ]),
        )
    } else if (file instanceof Blob && file.size !== 0) {
        const parsed = await simpleParser(
            Buffer.from(await (res.get("file") as File).arrayBuffer()),
        )

        const aiRes = await openAI(parsed)

        return new Response(
            JSON.stringify([{ subject: parsed.subject, desc: aiRes }]),
        )
    }

    return new NextResponse("No file or email provided")
}
}