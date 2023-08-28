import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/db"
import { index } from "@/db/schema"
import { env } from "@/env.mjs"
import { ImapFlow } from "imapflow"
import { simpleParser, type ParsedMail } from "mailparser"
import OpenAI from "openai"
import { kv } from "upstash-kv"
import { z } from "zod"

const imap = async () => {
    const imapClient = new ImapFlow({
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: {
            user: "shreyansthebest2007@gmail.com",
            pass: "hgjfxmnuxjfvwkbk",
        },
    })
    await imapClient.connect()
    const lock = await imapClient.getMailboxLock("INBOX")

    // 25470, 25832
    const messages = imapClient.fetch("25807:*", {
        source: true,
        uid: true,
    })

    // console.log(
    //     data.headers.toString(),
    //     data.internalDate,
    //     data.bodyStructure,
    //     data.envelope,
    //     data.bodyParts.get("1")?.toString(),
    // )

    return { messages, imapClient, lock }
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
    if (env.NODE_ENV === "production") {
        return new Response("Not available in production", {
            status: 400,
        })
    }
    console.log("hello")
    const { messages, imapClient, lock } = await imap()

    for await (const msg of messages) {
        const parsed = await simpleParser(msg.source)
        const desc = await openAI(parsed)
        if (
            desc === "MESSAGE TOO LONG" ||
            desc === "NO TEXT" ||
            desc === null ||
            desc === undefined
        )
            continue
        writeToDB("imap", parsed, desc, String(msg.uid))
    }

    lock.release()
    imapClient.close()

    return new Response()
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

    if (file) {
        const parsed = await simpleParser(
            Buffer.from(await (res.get("file") as File).arrayBuffer()),
        )

        const aiRes = await openAI(parsed)

        return new Response(aiRes)
    }

    if (!file && email) {
        return new Response("Thanks for signing up to the waitlist!")
    }

    return new NextResponse("No file or email provided")
}
