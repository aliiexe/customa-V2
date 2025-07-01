import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme-provider"
import { ClerkProvider } from "@clerk/nextjs"
import LayoutShell from "@/components/LayoutShell"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Product Management Dashboard",
  description: "A comprehensive product management dashboard",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider>
            <LayoutShell>{children}</LayoutShell>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
