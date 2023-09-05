"use client"

import Link from "next/link"
import { SignInButton, useAuth } from "@clerk/nextjs"
import { ReloadIcon } from "@radix-ui/react-icons"
import { For } from "million/react"
import { Balancer } from "react-wrap-balancer"

import { useResStore, useSubmitStateStore } from "@/lib/state"
import { FileForm } from "@/components/file-form"
import { Button } from "@/components/ui/button"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const gmailFetch = () => {
    useSubmitStateStore.setState({ submitState: "loading" })
    void fetch("/api/main")
        .then((res) => {
            void (
                res.json() as Promise<Array<{ subject: string; desc: string }>>
            ).then((v) => {
                useResStore.setState({ res: v })
            })
        })
        .finally(() => useSubmitStateStore.setState({ submitState: "idle" }))
}

const Home = () => {
    const res = useResStore((s) => s.res)
    const submitState = useSubmitStateStore((s) => s.submitState)

    const { isSignedIn } = useAuth()

    return (
        <>
            <section className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">
                    Automatic {"[ "}
                    <HoverCard openDelay={1}>
                        <HoverCardTrigger className="font-normal underline cursor-pointer">
                            How-To
                        </HoverCardTrigger>
                        <HoverCardContent className="text-base font-normal">
                            DM me on X{" "}
                            <Link
                                href="https://twitter.com/Destroyer_Xyz"
                                target="_blank"
                                className="underline"
                            >
                                @Destroyer_Xyz
                            </Link>
                        </HoverCardContent>
                    </HoverCard>
                    {" ]"}
                </h1>
                <div className="self-center flex flex-col gap-2">
                    {!isSignedIn ? (
                        <SignInButton>
                            <Button>Sign In</Button>
                        </SignInButton>
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={gmailFetch}
                                        disabled={submitState === "loading"}
                                    >
                                        {submitState === "loading" ? (
                                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                        ) : null}
                                        Start
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Summarise the last 5 emails from your
                                        inbox
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </section>
            <section className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">
                    Manual {"[ "}
                    <HoverCard openDelay={1}>
                        <HoverCardTrigger className="font-normal underline cursor-pointer">
                            How-To
                        </HoverCardTrigger>
                        <HoverCardContent>
                            <div className="space-y-2 mt-2">
                                <div>
                                    <span className="text-lg text-secondary-foreground">
                                        Gmail:
                                    </span>
                                    <ol className="text-base font-normal list-decimal list-inside">
                                        <li>
                                            Open an email (Preferrably one with
                                            text content).
                                        </li>
                                        <li>
                                            Click the three dots near the reply
                                            button.
                                        </li>
                                        <li>
                                            Select the &quot;Download
                                            message&quot; option.
                                        </li>
                                    </ol>
                                </div>

                                <div>
                                    <span className="text-lg text-secondary-foreground">
                                        Apple Mail:
                                    </span>
                                    <ol className="text-base font-normal list-decimal list-inside">
                                        <li>
                                            Open an email (Preferrably one with
                                            text content).
                                        </li>
                                        <li>
                                            Select File &gt; Save As in the
                                            menubar.
                                        </li>
                                        <li>
                                            Choose &quot;Raw Message
                                            Source&quot; in the Format dropdown.
                                        </li>
                                        <li>Click Save.</li>
                                    </ol>
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                    {" ]"}
                </h1>

                <FileForm />
            </section>
            <section className="mt-2">
                {submitState === "loading" ? (
                    <div className="flex flex-col self-center gap-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                ) : (
                    <For each={res} classname={""}>
                        {(v) => (
                            <div className="flex flex-col gap-2 mb-3">
                                <h2 className="font-medium text-lg underline">
                                    {v.subject}
                                </h2>
                                <p>
                                    <Balancer>{v.desc}</Balancer>
                                </p>
                            </div>
                        )}
                    </For>
                )}
            </section>
        </>
    )
}

export default Home
