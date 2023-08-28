import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { auth as clerkAuth, ClerkProvider, UserButton } from "@clerk/nextjs"

import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Findy Thingy",
    description: "A toy for buildspace n&w",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    const { userId } = clerkAuth()
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={cn(inter.className, "p-4")}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                    >
                        <header className="flex items-end justify-end">
                            {userId ? <UserButton /> : null}
                        </header>
                        <main className="flex flex-col gap-2">{children}</main>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}

export default RootLayout
