import { env } from "@/env.mjs"
import { auth, clerkClient } from "@clerk/nextjs"
import { google } from "googleapis"
import { simpleParser, type ParsedMail } from "mailparser"

export const GET = async () => {
    if (env.NODE_ENV === "production") {
        return new Response("Not available in production", {
            status: 400,
        })
    }
    const clerk = auth()
    const f = await clerkClient.users.getUserOauthAccessToken(
        clerk.userId!,
        "oauth_google",
    )
    console.log(f)

    const list = await google.gmail("v1").users.messages.list({
        userId: "me",
        oauth_token: f?.[0]?.token,
        maxResults: 10,
    })

    const messages: ParsedMail[] = []
    for (const message of list.data.messages!) {
        messages.push(
            await simpleParser(
                Buffer.from(
                    (
                        await google.gmail("v1").users.messages.get({
                            userId: "me",
                            id: message.id ?? undefined,
                            oauth_token: f?.[0]?.token,
                            format: "raw",
                        })
                    ).data.raw!,
                    "base64url",
                ),
            ),
        )
    }

    messages.forEach((message) => {
        console.log(message.subject)
        console.log(message.text)
        console.log("--------------------------------")
    })

    return new Response("hello")
}
