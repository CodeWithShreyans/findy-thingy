/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */

"use client"

import { useAiResStore, useSubmitStateStore } from "@/lib/state"
import { FileForm } from "@/components/file-form"
import { Skeleton } from "@/components/ui/skeleton"

const Home = () => {
    // @ts-ignore
    const aiRes = useAiResStore((s) => s.aiRes)
    // @ts-ignore
    const submitState = useSubmitStateStore((s) => s.submitState)

    return (
        <>
            <FileForm />
            {submitState === "loading" ? (
                <div className="flex flex-col w-[90%] self-center gap-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                </div>
            ) : (
                <p className="px-[10%] self-center">{aiRes}</p>
            )}
        </>
    )
}

export default Home
