"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { RotateCw } from "lucide-react"
import { For } from "million/react"
import { useForm } from "react-hook-form"
import Balancer from "react-wrap-balancer"
import { z } from "zod"

import { useResStore, useSearchStore, useSubmitStateStore } from "@/lib/state"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
    desc: z.string(),
})

const Page = () => {
    const search = useSearchStore((s) => s.res)
    const submitState = useSubmitStateStore((s) => s.submitState)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            desc: "",
        },
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        useSubmitStateStore.setState({ submitState: "loading" })

        void fetch(encodeURI(`/api/search?desc=${values.desc}`))
            .then((res) => {
                if (res.ok) {
                    void (
                        res.json() as Promise<{
                            to: string
                            from: string
                            date: string
                            subject: string
                            content: string
                        }>
                    ).then((v) => {
                        useSearchStore.setState({ res: v })
                        console.log(v)
                    })
                }
            })
            .finally(() =>
                useSubmitStateStore.setState({ submitState: "idle" }),
            )
    }

    return (
        <>
            <Form {...form}>
                <form
                    /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 self-center justify-self-center w-1/4"
                >
                    <FormField
                        control={form.control}
                        name="desc"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Search</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Contract with buildspace from last May"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Give a short description of the email you
                                    want to find. <br />
                                    For example: &quot;That contract from last
                                    May&quot;
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        disabled={submitState === "loading"}
                        className="self-center justify-self-center font-semibold text-lg p-6"
                    >
                        {submitState === "loading" ? (
                            <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Submit
                    </Button>
                </form>
            </Form>
            <section className="mt-2 mx-auto">
                {submitState === "loading" ? (
                    <div className="flex flex-col self-center gap-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
                ) : search ? (
                    <div className="flex flex-col gap-2 mb-3">
                        <h2 className="font-medium text-lg">
                            Subject:{" "}
                            <span className="underline">{search?.subject}</span>
                        </h2>
                        <h3>
                            <span className="font-medium">To:</span>{" "}
                            {search?.to}
                        </h3>
                        <h3>
                            <span className="font-medium">From:</span>{" "}
                            {search?.from}
                        </h3>
                        <h3>
                            <span className="font-medium">Date:</span>{" "}
                            {search?.date}
                        </h3>
                        <p
                            dangerouslySetInnerHTML={{ __html: search.content }}
                        />
                    </div>
                ) : null}
            </section>
        </>
    )
}

export default Page
