"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"

import { useAiResStore, useSubmitStateStore } from "@/lib/state"
// import { onSubmit } from "./server-action"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

export const FileForm = () => {
    const form = useForm()

    const onSubmit = async (formData: FormData) => {
        useSubmitStateStore.setState({ submitState: "loading" })

        const res = await fetch(`/api`, {
            method: "POST",
            body: formData,
        })

        useAiResStore.setState({ aiRes: await res.text() })
        useSubmitStateStore.setState({ submitState: "idle" })
    }

    return (
        <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            action={onSubmit}
            className="flex flex-col gap-4"
        >
            <div className="flex flex-col gap-2">
                <Label htmlFor="email">Your Email</Label>
                <Input
                    {...form.register("email")}
                    type="email"
                    name="email"
                    required
                />
                <desc className="text-[0.8rem] text-muted-foreground">
                    Your email will be added to our waitlist.
                </desc>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="file">Email File</Label>
                <Input
                    {...form.register("file")}
                    required
                    type="file"
                    name="file"
                    accept=".eml,message/rfc822"
                />
                <desc className="text-[0.8rem] text-muted-foreground">
                    Upload your email as a file. This is not stored anywhere.{" "}
                    <Link
                        href="https://google.com"
                        target="_blank"
                        className="underline"
                    >
                        Instructions
                    </Link>
                </desc>
            </div>

            <Button type="submit">Submit</Button>
        </form>
    )
}
