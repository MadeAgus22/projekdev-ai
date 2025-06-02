// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css" //
import { ThemeProvider } from "@/components/theme-provider" //
import { Toaster } from "@/components/ui/toaster" //

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistem Klinik Gigi",
  description: "Sistem manajemen klinik gigi berbasis web",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}> {/* <--- BARIS 23 YANG DISEBUTKAN ERROR */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}