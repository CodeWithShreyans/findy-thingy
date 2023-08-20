import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"

import NavBar from "@/components/ui/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "School Event Thingy",
    description: "{TODO}",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={inter.className}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                    >
                        <div className="flex min-h-screen">
                            <NavBar />
                            <main className="p-4 grow">{children}</main>
                        </div>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}

export default RootLayout
