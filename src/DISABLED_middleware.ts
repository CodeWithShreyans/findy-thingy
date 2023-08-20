import { authMiddleware } from "@clerk/nextjs"

import { env } from "./env.mjs"

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/nextjs/middleware for more information about configuring your middleware

let exp

if (env.NODE_ENV !== "production") {
    exp = () => {
        console.log("authMiddleware skipped in development")
    }
} else {
    exp = authMiddleware({})
}
export default exp

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
