"use client"

import Link from "next/link"
import { RotateCw } from "lucide-react"
import { useForm } from "react-hook-form"

import { useDialogStateStore, useSubmitStateStore } from "@/lib/state"
import { Button } from "./ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

const onSubmit = async (formData: FormData) => {
    useSubmitStateStore.setState({ submitState: "loading" })

    const res = await fetch(`/api/email`, {
        method: "POST",
        body: formData,
    })

    if (!res.ok) alert("Failed to add email. Please try again.")

    useSubmitStateStore.setState({ submitState: "idle" })
    useDialogStateStore.setState({ dialogState: false })
}

const Page = () => {
    const { submitState } = useSubmitStateStore()
    const { dialogState } = useDialogStateStore()
    const form = useForm()
    return (
        <Dialog
            open={dialogState}
            onOpenChange={(state) =>
                useDialogStateStore.setState({ dialogState: state })
            }
        >
            <DialogTrigger asChild>
                <Button className="text-xl font-semibold p-6">
                    Try it Out
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Try it out</DialogTitle>
                    <DialogDescription>
                        Drop your email here and I&apos;ll get back to you with
                        details on how to use the prodcut.
                    </DialogDescription>
                </DialogHeader>
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <form action={onSubmit}>
                    <div className="grid grid-cols-4 items-center gap-4 p-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            {...form.register("email")}
                            type="email"
                            name="email"
                            placeholder="rick@astley.com"
                            className="col-span-3"
                            required
                        />
                    </div>
                    <Link
                        href="/manual"
                        className="text-sm text-foreground opacity-70 transition-opacity hover:opacity-100"
                    >
                        Wanna try out the manual method in the mean time?
                    </Link>
                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            disabled={submitState === "loading"}
                        >
                            {submitState === "loading" ? (
                                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Submit
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default Page
