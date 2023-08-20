import { NextResponse, type NextRequest } from "next/server"
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

    const data = await imapClient.fetchOne("25470", {
        source: true,
    })

    // console.log(
    //     data.headers.toString(),
    //     data.internalDate,
    //     data.bodyStructure,
    //     data.envelope,
    //     data.bodyParts.get("1")?.toString(),
    // )

    lock.release()

    imapClient.close()

    return data
}

const openAI = async (parsed: ParsedMail) => {
    const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
    })

    // writeFile(
    //     "email.txt",
    //     `From: ${parsed.from?.text}\nTo: ${// @ts-ignore
    //     parsed.to?.text}\nSubject: ${
    //         parsed.subject
    //     }\nDate: ${parsed.date?.toDateString()}\nBody:\n${parsed.text}`,
    //     (err) => {
    //         if (err) throw err
    //         console.log("The file has been saved!")
    //     },
    // )

    // Request the OpenAI API for the response based on the prompt
    const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content:
                    "Analyze the contents of this email and output a keyword-only (no supporting words) indexable description that can be searched by giving the index back to you along with a short description of the email required.",
            },
            {
                role: "user",

                content: `From: ${parsed.from?.text}\nTo: ${
                    parsed.to instanceof Array
                        ? parsed.to.flatMap((item) => item.text).join(", ")
                        : parsed.to?.text
                }\nSubject: ${
                    parsed.subject
                }\nDate: ${parsed.date?.toDateString()}\nBody:\n${parsed.text}`,
            },
        ],
    })

    console.log(res.choices[0]?.message.content)

    return res.choices[0]?.message.content
}

export const GET = async () => {
    if (env.NODE_ENV === "production") {
        return new Response("Not available in production", {
            status: 400,
        })
    }
    const imapData = await imap()

    const parsed = await simpleParser(imapData.source)

    return await openAI(parsed)
}

export const POST = async (req: NextRequest) => {
    const res = await req.formData()

    console.log(res.getAll("file"))

    const email = res.get("email")

    if (!z.string().email().safeParse(email).success) {
        return new Response(null, {
            status: 400,
            statusText: "Invalid email",
        })
    }

    await kv.lrem("emails", 0, email?.toString())
    await kv.rpush("emails", email?.toString())

    const parsed = await simpleParser(
        Buffer.from(await (res.get("file") as File).arrayBuffer()),
    )

    const aiRes = await openAI(parsed)

    console.log(aiRes)

    return new NextResponse(aiRes)
}
