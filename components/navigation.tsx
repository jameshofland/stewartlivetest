"use client"

import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function HomeButton() {
  const pathname = usePathname()

  if (pathname === "/home") {
    return null
  }

  return (
    <Link href="/home">
      <Button
        variant="outline"
        size="icon"
        className="fixed top-6 left-6 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-lg"
      >
        <Home className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Go to Home</span>
      </Button>
    </Link>
  )
}
