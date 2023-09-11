"use client"

import { For } from "million/react"
import Balancer from "react-wrap-balancer"

import { useResStore, useSubmitStateStore } from "@/lib/state"
import { FileForm } from "@/components/file-form"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Skeleton } from "@/components/ui/skeleton"

const Page = () => {
    const res = useResStore((s) => s.res)
    const submitState = useSubmitStateStore((s) => s.submitState)
    return (
        <>
            <section className="flex flex-col gap-4 w-1/2">
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
                                <h2 className="font-medium text-lg">
                                    Subject:{" "}
                                    <span className="underline">
                                        {v.subject}
                                    </span>
                                </h2>
                                <p className="">
                                    <span className="font-medium">
                                        Description:
                                    </span>{" "}
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

export default Page
