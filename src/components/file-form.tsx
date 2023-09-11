"use client"

import { useUser } from "@clerk/nextjs"
import { RotateCw } from "lucide-react"
import { useForm } from "react-hook-form"

import { useResStore, useSubmitStateStore } from "@/lib/state"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

const onSubmit = async (formData: FormData) => {
    useSubmitStateStore.setState({ submitState: "loading" })

    const res = await fetch(`/api/main`, {
        method: "POST",
        body: formData,
    })

    useResStore.setState({
        res: (await res.json()) as Array<{
            subject: string
            desc: string
        }>,
    })
    useSubmitStateStore.setState({ submitState: "idle" })
}

// million-ignore
export const FileForm = () => {
    const { submitState } = useSubmitStateStore()
    const form = useForm()

    const { user } = useUser()

    return (
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        <form action={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Label htmlFor="email">Your Email (optional)</Label>
                <Input
                    {...form.register("email")}
                    type="email"
                    name="email"
                    defaultValue={user?.emailAddresses[0]?.emailAddress}
                />
                <p className="text-[0.8rem] text-muted-foreground">
                    Your email will be added to our waitlist.
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="file">Email File (optional)</Label>
                <Input
                    {...form.register("file")}
                    type="file"
                    name="file"
                    accept=".eml,message/rfc822"
                />
                <p className="text-[0.8rem] text-muted-foreground">
                    Upload your email as a file. This is not stored anywhere.
                </p>
            </div>

            <Button type="submit" disabled={submitState === "loading"}>
                {submitState === "loading" ? (
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit
            </Button>
        </form>
    )
}
