import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context-new"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Kia Qazaqstan - Панель управления лидами",
  description: "Панель управления лидами Kia Qazaqstan",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
