import type React from "react"
import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: "Project Stewart",
  description: "eXp's data, reimagined.",
  generator: "v0.dev",
  // 👇 add this
  robots: {
    index: false,
    follow: false,
    // (If TS complains about extra flags like `noarchive`, skip them—our HTTP header already covers it)
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${outfit.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
          storageKey="project-stewart-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
