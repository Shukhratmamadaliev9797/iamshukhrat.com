import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PageTransitionProvider } from "@/components/page-transition"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shukhrat Mamadaliev | Full Stack Developer",
  description: "Full Stack Developer based in Uzbekistan",
  generator: "Shukhrat Mamadaliev",
  icons: {
    icon: [
      {
        url: "logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "logo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "logo.png",
        type: "image/svg+xml",
      },
    ],
    apple: "logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <PageTransitionProvider>
          {children}
        </PageTransitionProvider>
        <Analytics />
      </body>
    </html>
  )
}
