import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

import type { Metadata } from "next"
import { Inter } from "next/font/google"

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
    return (
        <html lang="en">
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <main className="flex flex-col gap-8 p-4">{children}</main>
                </ThemeProvider>
            </body>
        </html>
    )
}

export default RootLayout
