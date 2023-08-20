"use server"

import { env } from "@/env.mjs"

export const onSubmit = async (formData: FormData) => {
    await fetch(`${env.NEXT_PUBLIC_APP_URL}/api`, {
        method: "POST",
        body: formData,
    })
}
