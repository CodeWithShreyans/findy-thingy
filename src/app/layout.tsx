import { dark } from "@clerk/themes"
import { Analytics } from "@vercel/analytics/react"

import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Provider } from "react-wrap-balancer"

import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Findy Thingy",
    description: "Find your stuff",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ClerkProvider appearance={{ baseTheme: dark }}>
            <html lang="en">
                <body className={cn(inter.className, "p-4 pt-8 h-screen")}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                    >
                        <Provider>
                            <main className="flex flex-col gap-2 min-h-full items-center justify-center">
                                {children}
                            </main>
                        </Provider>
                    </ThemeProvider>
                    <Analytics />
                </body>
            </html>
        </ClerkProvider>
    )
}

export default RootLayout
