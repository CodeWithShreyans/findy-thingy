"use client"

import "@/app/body.css"

import { useAuth, useSignIn } from "@clerk/nextjs"
import { RotateCw } from "lucide-react"
import { For } from "million/react"
import { Balancer } from "react-wrap-balancer"

import { useResStore, useSubmitStateStore } from "@/lib/state"
import { Button } from "@/components/ui/button"
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

const Page = () => {
    const res = useResStore((s) => s.res)
    const submitState = useSubmitStateStore((s) => s.submitState)

    const { isSignedIn } = useAuth()
    const { signIn } = useSignIn()
    return (
        <>
            {!isSignedIn ? (
                // <SignUpButton mode="modal">
                <Button
                    className="self-center justify-self-center font-semibold text-xl p-6"
                    size="lg"
                    onClick={() =>
                        void signIn?.authenticateWithRedirect({
                            strategy: "oauth_google",
                            redirectUrl: "/auth",
                            redirectUrlComplete: "/auto",
                        })
                    }
                >
                    Sign In
                </Button>
            ) : !res.length ? (
                // </SignUpButton>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={gmailFetch}
                                disabled={submitState === "loading"}
                                className="self-center justify-self-center font-semibold text-xl p-6"
                            >
                                {submitState === "loading" ? (
                                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Start
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-sm">
                                Summarise the last email from your inbox
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : null}
            <section className="mt-2 mx-auto">
                {submitState === "loading" ? (
                    <div className="flex flex-col self-center gap-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                ) : (
                    <For each={res} classname="">
                        {(v) => (
                            <div className="flex flex-col gap-2 mb-3">
                                <h2>
                                    <span className="font-semibold text-xl underline">
                                        Subject:
                                    </span>{" "}
                                    <span className="font-medium text-xl">
                                        {v.subject}
                                    </span>
                                </h2>
                                <p>
                                    <span className="font-semibold text-lg underline">
                                        Description:
                                    </span>{" "}
                                    <Balancer className="text-lg">
                                        {v.desc}
                                    </Balancer>
                                </p>
                            </div>
                        )}
                    </For>
                )}
            </section>
        </>
    )
}

export default Page
