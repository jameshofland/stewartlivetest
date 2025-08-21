"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Moon,
  Sun,
  BarChart3,
  TrendingUp,
  FileText,
  Layers,
  Calculator,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { HomeButton } from "@/components/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { LoadingFallback } from "@/components/loading-fallback"

// Lazy load route components
const ReconciliationDashboard = dynamic(() => import("../reconciliation/page"), {
  loading: () => (
    <LoadingFallback
      title="Loading Reconciliation Dashboard"
      description="Preparing transaction data and analytics..."
    />
  ),
  ssr: false,
})

const StateCountDashboard = dynamic(() => import("../statecount/page"), {
  loading: () => (
    <LoadingFallback title="Loading State Count Dashboard" description="Loading geographic distribution analytics..." />
  ),
  ssr: false,
})

const ANPSDashboard = dynamic(() => import("../aNPS/page"), {
  loading: () => <LoadingFallback title="Loading aNPS Dashboard" description="Preparing agent feedback analytics..." />,
  ssr: false,
})

const dashboardCategories = [
  {
    id: 1,
    title: "BOps Dashboards",
    icon: BarChart3,
    description: "Brokerage Operations Analytics",
    miniCards: [
      {
        title: "aNPS Reimagined",
        description: "Levelled up Agent feedback",
        href: "/aNPS",
        icon: BarChart3,
        component: "anps",
      },
      {
        title: "Commission Analytics",
        description: "Commission tracking and analysis",
        href: "#",
        icon: TrendingUp,
      },
    ],
  },
  {
    id: 2,
    title: "TOps Dashboards",
    icon: TrendingUp,
    description: "Transaction Operations Data",
    miniCards: [
      {
        title: "Transaction Reconciliation Dashboard",
        description: "Financial reconciliation and validation",
        href: "/reconciliation",
        icon: Calculator,
        component: "reconciliation",
      },
      {
        title: "State-by-State File Count Dashboard",
        description: "Geographic distribution analytics",
        href: "/statecount",
        icon: MapPin,
        component: "statecount",
      },
    ],
  },
  {
    id: 3,
    title: "ASC Dashboards",
    icon: FileText,
    description: "Account Solutions Center Metrics",
    miniCards: [
      {
        title: "ASC Monthly",
        description: "Invoices",
        href: "#",
        icon: FileText,
      },
      {
        title: "Support Metrics Dashboard",
        description: "Customer support analytics",
        href: "#",
        icon: BarChart3,
      },
    ],
  },
  {
    id: 4,
    title: "Other Dashboards",
    icon: Layers,
    description: "Additional Analytics/Reports",
    miniCards: [
      {
        title: "Executive Summary Dashboard",
        description: "High-level executive insights",
        href: "#",
        icon: TrendingUp,
      },
      {
        title: "Custom Reports Dashboard",
        description: "Build and manage custom reports",
        href: "#",
        icon: Layers,
      },
    ],
  },
]

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="fixed top-6 right-6 z-50 w-10 h-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/50 rounded-md animate-pulse" />
    )
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-lg"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function DashboardCard({ category }: { category: (typeof dashboardCategories)[0] }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loadingComponent, setLoadingComponent] = useState<string | null>(null)
  const IconComponent = category.icon

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const handleMiniCardClick = (miniCard: any, e: React.MouseEvent) => {
    if (miniCard.component) {
      e.preventDefault()
      setLoadingComponent(miniCard.component)

      // Simulate navigation with lazy loading
      setTimeout(() => {
        window.location.href = miniCard.href
      }, 100)
    }
  }

  // Show loading component if one is being loaded
  if (loadingComponent === "reconciliation") {
    return <ReconciliationDashboard />
  }
  if (loadingComponent === "statecount") {
    return <StateCountDashboard />
  }
  if (loadingComponent === "anps") {
    return <ANPSDashboard />
  }

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <Card
        className={`group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-500/50 transition-all duration-500 cursor-pointer ${
          isExpanded
            ? "scale-95 shadow-lg hover:shadow-xl"
            : "hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20"
        }`}
        onClick={toggleExpanded}
      >
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 p-3 rounded-full shadow-lg">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {category.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm font-light">{category.description}</p>
            </div>

            {/* Expand/Collapse Indicator */}
            <div className="flex items-center justify-center">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300" />
              )}
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </CardContent>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-400/10 dark:via-indigo-400/10 dark:to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </Card>

      {/* Mini Cards */}
      <div
        className={`space-y-3 transition-all duration-500 ease-in-out ${
          isExpanded ? "opacity-100 max-h-96 translate-y-0" : "opacity-0 max-h-0 -translate-y-4 overflow-hidden"
        }`}
      >
        {category.miniCards.map((miniCard, index) => {
          const MiniIconComponent = miniCard.icon
          return (
            <Link key={index} href={miniCard.href} onClick={(e) => handleMiniCardClick(miniCard, e)}>
              <Card className="group/mini bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-gray-200/30 dark:border-gray-700/30 hover:border-blue-300/40 dark:hover:border-blue-500/40 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg cursor-pointer ml-4">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 rounded-lg blur-sm opacity-20 group-hover/mini:opacity-30 transition-opacity duration-300"></div>
                      <div className="relative bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 p-2 rounded-lg shadow-md">
                        <MiniIconComponent className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-white group-hover/mini:text-blue-600 dark:group-hover/mini:text-blue-400 transition-colors duration-300 truncate">
                        {miniCard.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                        {miniCard.description}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 rotate-[-90deg] group-hover/mini:text-blue-500 dark:group-hover/mini:text-blue-400 transition-colors duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/20 transition-colors duration-500">
      <HomeButton />
      <ThemeToggle />

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-16 pb-20">
        <div className="text-center max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 mb-12">
            {/* Text Content */}
            <div className="flex-shrink-0">
              {/* Main Title */}
              <div className="relative mb-8">
                <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter text-gray-900 dark:text-white mb-4 leading-none">
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-navy-600 via-blue-700 to-indigo-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                      PROJECT
                    </span>
                    <div className="absolute -inset-1 bg-gradient-to-r from-navy-600/20 via-blue-700/20 to-indigo-600/20 dark:from-blue-400/30 dark:via-indigo-400/30 dark:to-purple-400/30 blur-xl opacity-70"></div>
                  </span>
                  <br />
                  <span className="relative inline-block mt-2">
                    <span className="text-gray-800 dark:text-gray-100 font-black tracking-wider">STEWART</span>
                  </span>
                </h1>

                {/* Dynamic accent line */}
                <div className="flex justify-center items-center space-x-4 mb-10">
                  <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-amber-400 dark:to-amber-300"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 dark:from-amber-300 dark:to-yellow-400 flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-amber-400 dark:to-amber-300"></div>
                </div>
              </div>

              {/* Subtitle */}
              <div className="relative">
                <p className="text-xl md:text-2xl lg:text-3xl xl:text-4xl text-gray-600 dark:text-gray-300 font-light italic tracking-wide leading-relaxed">
                  <span className="relative">
                    eXp's data,{" "}
                    <span className="font-medium bg-gradient-to-r from-amber-500 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 bg-clip-text text-transparent">
                      reimagined
                    </span>
                    <span className="text-amber-500 dark:text-amber-400">.</span>
                  </span>
                </p>

                {/* Subtle background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/10 to-purple-500/5 dark:from-blue-400/10 dark:via-indigo-400/15 dark:to-purple-400/10 blur-3xl -z-10"></div>
              </div>
            </div>

            {/* Stewart Image - Right Side */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                {/* Main Stewart Image */}
                <div className="relative z-10">
                  <img
                    src="/images/stewart.png"
                    alt="Stewart - The friendly AI assistant robot"
                    className="w-48 md:w-64 lg:w-72 xl:w-80 h-auto drop-shadow-2xl dark:drop-shadow-[0_25px_25px_rgba(59,130,246,0.15)]"
                  />
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-indigo-400/20 to-purple-400/20 dark:from-blue-400/30 dark:via-indigo-400/30 dark:to-purple-400/30 rounded-full blur-3xl scale-110 -z-10"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-gradient-to-r from-teal-400/10 to-cyan-400/10 dark:from-teal-400/20 dark:to-cyan-400/20 rounded-full blur-2xl -z-20"></div>

                {/* Floating Elements */}
                <div className="absolute top-8 right-8 w-3 h-3 bg-teal-400 dark:bg-teal-300 rounded-full opacity-60 animate-pulse shadow-lg"></div>
                <div className="absolute bottom-12 left-8 w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full opacity-40 animate-pulse delay-1000 shadow-lg"></div>
                <div className="absolute top-1/3 left-4 w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-300 rounded-full opacity-50 animate-pulse delay-2000 shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="max-w-6xl mx-auto mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {dashboardCategories.map((category) => (
              <DashboardCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-2 h-2 bg-amber-400 dark:bg-amber-300 rounded-full opacity-60 animate-pulse shadow-lg"></div>
      <div className="absolute top-1/3 right-20 w-1 h-1 bg-blue-400 dark:bg-blue-300 rounded-full opacity-40 animate-pulse delay-1000 shadow-lg"></div>
      <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-indigo-400 dark:bg-indigo-300 rounded-full opacity-50 animate-pulse delay-2000 shadow-lg"></div>
    </div>
  )
}
