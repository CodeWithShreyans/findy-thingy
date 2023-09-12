import { type NextRequest } from "next/server"
import { env } from "@/env.mjs"
import { Resend } from "resend"
import kv from "upstash-kv"
import { z } from "zod"

export const POST = async (req: NextRequest) => {
    const email = (await req.formData()).get("email")

    if (!email) return new Response("No email provided", { status: 400 })

    if (!z.string().email().safeParse(email).success) {
        return new Response(null, {
            status: 400,
            statusText: "Invalid email",
        })
    }

    await kv.lrem("emails", 0, email?.toString())
    await kv.rpush("emails", email?.toString())

    const resend = new Resend(env.RESEND_API_KEY)
    await resend.sendEmail({
        from: "Findy Thingy <ft@shreyans.sh>",
        to: "shreyans@shreyans.sh",
        subject: "Email",
        text: email.toString(),
    })

    return new Response(undefined, { status: 204 })
}
