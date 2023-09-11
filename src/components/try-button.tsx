import Link from "next/link"

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

const Page = () => {
    return (
        <Dialog>
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

                <div className="grid grid-cols-4 items-center gap-4 p-4">
                    <Label htmlFor="email" className="text-right">
                        Email
                    </Label>
                    <Input
                        id="email"
                        placeholder="rick@astley.com"
                        className="col-span-3"
                    />
                </div>
                <Link
                    href="/manual"
                    className="text-sm text-foreground underline hover:text-muted-foreground"
                >
                    Wanna try out the manual method in the mean time?
                </Link>
                <DialogFooter>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default Page
