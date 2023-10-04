import { type NextRequest } from "next/server"
import { db } from "@/db"
import { main } from "@/db/schema"
import { env } from "@/env.mjs"
import { auth, clerkClient } from "@clerk/nextjs"
import { eq } from "drizzle-orm"
import { google } from "googleapis"
import { simpleParser } from "mailparser"
import OpenAI from "openai"
import kv from "upstash-kv"

const chunk = <T>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = []

    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize)
        chunks.push(chunk)
    }

    return chunks
}

export const GET = async (req: NextRequest) => {
    const desc = req.nextUrl.searchParams.get("desc")

    const index = await db.query.main.findMany({
        where: eq(main.userId, "user_2UZLBlyilBNuHhU6foi8aGbVq9r"),
        columns: { userId: false },
    })

    index.forEach((v) => console.log("index", v))

    const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
        fetch: fetch,
    })

    const openaiCreate = (fullPrompt: string) => {
        console.log(fullPrompt)
        return openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: fullPrompt,
                },
                { role: "user", content: desc },
            ],
        })
    }

    const chunks = chunk(index, 10)

    chunks.forEach((v) => v.forEach((v2) => console.log("chunk", v2)))

    const prompt = await kv.get<string>("prompt2")
    const openaiReqs: Array<ReturnType<typeof openaiCreate>> = []
    chunks.forEach((v) => {
        let fullPrompt = prompt + "\n"
        v.forEach((v2) => (fullPrompt += `${v2.gmailId}: ${v2.description}\n`))
        openaiReqs.push(openaiCreate(fullPrompt))
    })

    const responses = await Promise.allSettled(openaiReqs)
    const res: Array<string | null | undefined> = []

    for (const v of responses) {
        if (v.status === "fulfilled") {
            index.forEach((v2) =>
                console.log(
                    v2.gmailId,
                    "|",
                    v.value.choices[0]?.message.content,
                    "|",
                ),
            )
            console.log(
                index.find(
                    (v2) => v2.gmailId == v.value.choices[0]?.message.content,
                ),
            )
            if (v.value.choices[0]?.message.content != "null") {
                res.push(v.value.choices[0]?.message.content)
            }
        }
    }
    if (!res) {
        console.log(res)
        return new Response("No match found", { status: 400 })
    }

    const clerk = auth()
    const clerkToken = (
        await clerkClient.users.getUserOauthAccessToken(
            clerk.userId!,
            "oauth_google",
        )
    )?.[0]?.token
    let finalId: string | null | undefined
    if (res.length > 1) {
        let fullPrompt = prompt + "\n"
        for (const v of res) {
            fullPrompt += `${v}: ${index.find((v2) => v2.gmailId == v)
                ?.description}\n`
        }
        console.log("PROMPT", fullPrompt, "LEN", res.length)
        finalId = (
            await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: fullPrompt,
                    },
                    { role: "user", content: desc },
                ],
            })
        ).choices[0]?.message.content
    }
    const msg = (
        await google.gmail("v1").users.messages.get({
            userId: "me",
            id:
                index.find((v2) => v2.gmailId == (finalId ?? res[0]))
                    ?.gmailId ?? undefined,
            oauth_token: clerkToken,
            format: "raw",
        })
    ).data.raw!
    const parsed = await simpleParser(Buffer.from(msg, "base64url"))
    return new Response(
        JSON.stringify({
            to:
                parsed.to instanceof Array
                    ? parsed.to[0]?.text
                    : parsed.to?.text,
            from: parsed.from?.text,
            date: parsed.date?.toString(),
            subject: parsed.subject,
            content: parsed.textAsHtml,
        }),
    )
}
