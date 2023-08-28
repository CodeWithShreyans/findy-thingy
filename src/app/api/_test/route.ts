import { auth, clerkClient } from "@clerk/nextjs"
import { google } from "googleapis"

export const GET = async () => {
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
