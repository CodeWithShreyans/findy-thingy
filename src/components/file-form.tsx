"use client"

import { useForm } from "react-hook-form"

import { useAiResStore, useSubmitStateStore } from "@/lib/state"
// import { onSubmit } from "./server-action"
import { Button } from "./ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"

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
                    <Dialog>
                        <DialogTrigger className="underline">
                            Instructions
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Instructions</DialogTitle>
                                <Separator />
                                <DialogDescription>
                                    <div className="space-y-2 mt-2">
                                        <div>
                                            <span className="text-secondary-foreground">
                                                Gmail:
                                            </span>
                                            <ol className="list-decimal list-inside">
                                                <li>
                                                    Open an email (Preferrably
                                                    one with text content).
                                                </li>
                                                <li>
                                                    Click the three dots near
                                                    the reply button.
                                                </li>
                                                <li>
                                                    Select the &quot;Download
                                                    message&quot; option.
                                                </li>
                                            </ol>
                                        </div>

                                        <div>
                                            <span className="text-secondary-foreground">
                                                Apple Mail:
                                            </span>
                                            <ol className="list-decimal list-inside">
                                                <li>
                                                    Open an email (Preferrably
                                                    one with text content).
                                                </li>
                                                <li>
                                                    Select File &gt; Save As in
                                                    the menubar.
                                                </li>
                                                <li>
                                                    Choose &quot;Raw Message
                                                    Source&quot; in the Format
                                                    dropdown.
                                                </li>
                                                <li>Click Save.</li>
                                            </ol>
                                        </div>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </desc>
            </div>

            <Button type="submit">Submit</Button>
        </form>
    )
}
