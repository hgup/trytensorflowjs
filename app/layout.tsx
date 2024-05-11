import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import clsx from "clsx"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Tensorflow app",
  description: "Based on a Fireship tutorial",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={clsx(inter.className, "h-screen")}>{children}</body>
    </html>
  )
}
