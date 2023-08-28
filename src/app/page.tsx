/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
"use client"

import { SignInButton, SignOutButton, useAuth, UserButton } from "@clerk/nextjs"

import { useAiResStore, useSubmitStateStore } from "@/lib/state"
import { FileForm } from "@/components/file-form"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const Home = () => {
    // @ts-ignore
    const aiRes = useAiResStore((s) => s.aiRes)
    // @ts-ignore
    const submitState = useSubmitStateStore((s) => s.submitState)

    const { isSignedIn } = useAuth()

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
            <div className="flex items-end justify-end">
                {!isSignedIn ? (
                    <SignInButton>
                        <Button>Sign In</Button>
                    </SignInButton>
                ) : (
                    <SignOutButton>
                        <Button>Sign Out</Button>
                    </SignOutButton>
                )}
            </div>
        </>
    )
}

export default Home
