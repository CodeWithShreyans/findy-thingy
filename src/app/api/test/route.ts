import { env } from "@/env.mjs"
import { auth, clerkClient } from "@clerk/nextjs"
import { google } from "googleapis"

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

    const goog = await google
        .gmail("v1")
        .users.messages.list({ userId: "me", oauth_token: f?.[0]?.token })

    console.log(goog.data)
    return new Response("hello")
}
