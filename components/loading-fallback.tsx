"use client"

import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface LoadingFallbackProps {
  title?: string
  description?: string
}

export function LoadingFallback({
  title = "Loading Dashboard",
  description = "Please wait while we load your data...",
}: LoadingFallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/20 transition-colors duration-500">
      <div className="container mx-auto px-6 py-16">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 rounded-full blur-lg opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 p-4 rounded-full shadow-lg mx-auto w-16 h-16 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-light">{description}</p>

              {/* Loading skeleton bars */}
              <div className="mt-6 space-y-3">
                <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-pulse"></div>
                <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-pulse w-3/4"></div>
                <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-pulse w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
