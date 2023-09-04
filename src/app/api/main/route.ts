import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/db"
import { index } from "@/db/schema"
import { env } from "@/env.mjs"
import { auth, clerkClient } from "@clerk/nextjs"
import { google } from "googleapis"
import { ImapFlow } from "imapflow"
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

const gmailFetch = async () => {
    const clerk = auth()
    const oauthToken = await clerkClient.users.getUserOauthAccessToken(
        clerk.userId!,
        "oauth_google",
    )

    const list = await google.gmail("v1").users.messages.list({
        userId: "me",
        oauth_token: oauthToken?.[0]?.token,
        maxResults: 5,
        q: "in:inbox",
    })

    const messages: ParsedMessage[] = []
    for (const message of list.data.messages!) {
        messages.push({
            mail: await simpleParser(
                Buffer.from(
                    (
                        await google.gmail("v1").users.messages.get({
                            userId: "me",
                            id: message.id ?? undefined,
                            oauth_token: oauthToken?.[0]?.token,
                            format: "raw",
                        })
                    ).data.raw!,
                    "base64url",
                ),
            ),
            gmailId: message.id!,
        })
    }

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

    let model: "gpt-3.5-turbo" | "gpt-3.5-turbo-16k"
    if (content.length < 7000) model = "gpt-3.5-turbo"
    else if (content.length < 24000) model = "gpt-3.5-turbo-16k"
    else return "MESSAGE TOO LONG"

    const res = await openai.chat.completions.create({
        model: model,
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

const writeToDB = (
    source: "imap" | "gmail",
    parsed: ParsedMail,
    desc: string,
    imapId?: string,
) => {
    const writeRes = db
        .insert(index)
        .values({
            imapId: source === "imap" ? imapId : null,
            gmailId: source === "gmail" ? "TODO" : null,
            from: parsed.from?.text,
            date: parsed.date?.getTime(),
            subject: parsed.subject,
            description: desc,
        })
        .run()

    console.log(writeRes)

    return writeRes
}

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

    const { messages } = await gmailFetch()

    // if (!messages) {
    //     return new Response("Email fetch method not chosen", { status: 400 })
    // }

    const res: Array<{ subject: string; desc: string }> = []

    for (const msg of messages) {
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
    }

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

    if ((!file || (file instanceof File && file.size === 0)) && email) {
        return new Response(
            JSON.stringify([
                { subject: "Thanks for signing up to the waitlist!", desc: "" },
            ]),
        )
    } else if (file instanceof File && file.size !== 0) {
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
