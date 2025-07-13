import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme-provider"
import { ClerkProvider } from "@clerk/nextjs"
import LayoutShell from "@/components/LayoutShell"
import { CurrencyProvider } from "@/lib/currency-provider"
import Sidebar from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Customa",
  description: "A Dashboard made you specially for your needs!"
  title: "Customa - Stock Management",
  description: "A comprehensive product management dashboard",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
          card: "shadow-lg border border-gray-200",
          headerTitle: "text-2xl font-bold text-gray-900",
          headerSubtitle: "text-gray-600",
          formFieldInput: "border border-gray-300 focus:border-primary focus:ring-primary/20",
          formFieldLabel: "text-gray-700 font-medium",
          footerActionLink: "text-primary hover:text-primary/80",
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider>
            <LayoutShell>{children}</LayoutShell>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
    <html lang="en">
      <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <CurrencyProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            </div>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
