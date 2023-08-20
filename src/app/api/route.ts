import { writeFile } from "fs"
import { env } from "@/env.mjs"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ImapFlow } from "imapflow"
import { simpleParser, type ParsedMail } from "mailparser"
import OpenAI from "openai"

const getParseEmail = async () => {
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
        headers: true,
        internalDate: true,
        bodyStructure: true,
        envelope: true,
        bodyParts: ["1"],
    })

    const parsed = await simpleParser(data.source)

    console.log(
        parsed.from,
        parsed.to,
        parsed.subject,
        parsed.date,
        parsed.text,
    )

    // console.log(
    //     data.headers.toString(),
    //     data.internalDate,
    //     data.bodyStructure,
    //     data.envelope,
    //     data.bodyParts.get("1")?.toString(),
    // )

    lock.release()

    imapClient.close()

    return parsed
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
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: [
            {
                role: "system",
                content:
                    "Analyze the contents of this email and output a keyword-only (no supporting words) indexable description that can be searched by giving the index back to you along with a short description of the email required.",
            },
            {
                role: "user",

                content: `From: ${parsed.from?.text}\nTo: ${// @ts-ignore
                parsed.to?.text}\nSubject: ${
                    parsed.subject
                }\nDate: ${parsed.date?.toDateString()}\nBody:\n${parsed.text}`,
            },
        ],
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response)

    // Respond with the stream
    return new StreamingTextResponse(stream)
}

export const GET = async () => {
    const parsed = await getParseEmail()

    return openAI(parsed)
}
