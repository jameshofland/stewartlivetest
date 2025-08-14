"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "./components/ui/card"
import { Button } from "./components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Badge } from "./components/ui/badge"
import { TooltipProvider } from "./components/ui/tooltip"
import { Calendar, TrendingUp, TrendingDown, Minus, MapPin, Moon, Sun, Database, Home } from "lucide-react"
import { USMap } from "./components/us-map"
import { StateCard } from "./components/state-card"
import { DatabaseService } from "./lib/database"
import Link from "next/link"

export default function RealEstateDashboard() {
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState("current")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [hoveredState, setHoveredState] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [currentData, setCurrentData] = useState<Record<string, any>>({})
  const [availableMonths, setAvailableMonths] = useState<Array<{ value: string; label: string }>>([])
  const [regions, setRegions] = useState<string[]>([])

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [data, months, regionsList] = await Promise.all([
          DatabaseService.getStateDataByMonth(selectedMonth),
          DatabaseService.getAvailableMonths(),
          DatabaseService.getRegions(),
        ])

        setCurrentData(data)
        setAvailableMonths(months)
        setRegions(regionsList)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedMonth])

  const filteredStates = useMemo(() => {
    if (selectedRegion === "all") return Object.keys(currentData)
    return Object.keys(currentData).filter((state) => currentData[state]?.region === selectedRegion)
  }, [currentData, selectedRegion])

  const totalSummary = useMemo(() => {
    const selectedData =
      selectedStates.length > 0
        ? selectedStates.map((state) => currentData[state]).filter(Boolean)
        : Object.values(currentData)

    return selectedData.reduce(
      (acc, state) => ({
        open: acc.open + (state?.open || 0),
        closed: acc.closed + (state?.closed || 0),
        withdrawn: acc.withdrawn + (state?.withdrawn || 0),
        total: acc.total + (state?.total || 0),
      }),
      { open: 0, closed: 0, withdrawn: 0, total: 0 },
    )
  }, [selectedStates, currentData])

  const handleStateClick = (stateCode: string) => {
    if (!selectedStates.includes(stateCode)) {
      setSelectedStates((prev) => [...prev, stateCode])
    }
  }

  const handleRemoveState = (stateCode: string) => {
    setSelectedStates((prev) => prev.filter((state) => state !== stateCode))
  }

  const getStateIntensity = (stateCode: string) => {
    const state = currentData[stateCode]
    if (!state) return 0
    const maxTotal = Math.max(...Object.values(currentData).map((s: any) => s?.total || 0))
    return maxTotal > 0 ? (state.total / maxTotal) * 100 : 0
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 text-emerald-400" />
    if (change < 0) return <TrendingDown className="w-3 h-3 text-red-400" />
    return <Minus className="w-3 h-3 text-gray-400" />
  }

  const themeClasses = isDarkMode
    ? "bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white"
    : "bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 text-gray-900"

  // Only show breakdown metrics for current month
  const showBreakdownMetrics = selectedMonth === "current"

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses}`}>
        <div className="text-center">
          <Database
            className={`w-16 h-16 mx-auto mb-4 animate-pulse ${isDarkMode ? "text-cyan-400" : "text-blue-600"}`}
          />
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Loading Dashboard
          </h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Connecting to Supabase database...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={`min-h-screen transition-all duration-500 ${themeClasses}`}>
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {isDarkMode ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.12),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.08),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,219,255,0.08),transparent_50%)]" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.08),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.06),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(34,197,94,0.06),transparent_50%)]" />
            </>
          )}
        </div>

        {/* Header */}
        <motion.header
          className={`relative z-50 ${
            isDarkMode
              ? "bg-slate-950/80 border-cyan-500/20 shadow-cyan-500/5"
              : "bg-white/80 border-blue-500/20 shadow-blue-500/5"
          } backdrop-blur-2xl border-b shadow-lg transition-all duration-500`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${
                      isDarkMode
                        ? "bg-slate-900/50 border-cyan-500/30 text-white hover:bg-cyan-500/20 hover:border-cyan-400/50"
                        : "bg-white/50 border-blue-300 text-gray-700 hover:bg-blue-100"
                    } backdrop-blur-xl transition-all`}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <div>
                  <h1
                    className={`text-3xl font-bold ${
                      isDarkMode
                        ? "bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
                        : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                    } bg-clip-text text-transparent`}
                  >
                    State Transaction Count Dashboard
                  </h1>
                  <p
                    className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} mt-1 flex items-center gap-2`}
                  >
                    <Database className={`w-4 h-4 ${isDarkMode ? "text-cyan-400" : "text-blue-500"}`} />
                    Real-time data from Supabase
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`${
                    isDarkMode
                      ? "bg-slate-900/50 border-yellow-500/30 text-white hover:bg-yellow-500/20 hover:border-yellow-400/50"
                      : "bg-white/50 border-gray-300 text-gray-700 hover:bg-gray-100"
                  } backdrop-blur-xl transition-all`}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger
                    className={`w-40 ${
                      isDarkMode
                        ? "bg-slate-900/50 border-cyan-500/30 text-white hover:border-cyan-400/50"
                        : "bg-white/50 border-blue-300 text-gray-700 hover:border-blue-400"
                    } backdrop-blur-xl transition-all`}
                  >
                    <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? "text-cyan-400" : "text-blue-500"}`} />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${
                      isDarkMode ? "bg-slate-900/95 border-cyan-500/30" : "bg-white/95 border-blue-300"
                    } backdrop-blur-xl`}
                  >
                    {availableMonths.map((month) => (
                      <SelectItem
                        key={month.value}
                        value={month.value}
                        className={`${
                          isDarkMode ? "text-white hover:bg-cyan-500/20" : "text-gray-700 hover:bg-blue-100"
                        }`}
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger
                    className={`w-36 ${
                      isDarkMode
                        ? "bg-slate-900/50 border-purple-500/30 text-white hover:border-purple-400/50"
                        : "bg-white/50 border-purple-300 text-gray-700 hover:border-purple-400"
                    } backdrop-blur-xl transition-all`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={`${
                      isDarkMode ? "bg-slate-900/95 border-purple-500/30" : "bg-white/95 border-purple-300"
                    } backdrop-blur-xl`}
                  >
                    <SelectItem
                      value="all"
                      className={`${
                        isDarkMode ? "text-white hover:bg-purple-500/20" : "text-gray-700 hover:bg-purple-100"
                      }`}
                    >
                      All Regions
                    </SelectItem>
                    {regions.map((region) => (
                      <SelectItem
                        key={region}
                        value={region}
                        className={`${
                          isDarkMode ? "text-white hover:bg-purple-500/20" : "text-gray-700 hover:bg-purple-100"
                        }`}
                      >
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Summary Cards */}
        <motion.div
          className="relative z-10 container mx-auto px-6 py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={`grid ${showBreakdownMetrics ? "grid-cols-4" : "grid-cols-1"} gap-4 mb-6`}>
            {showBreakdownMetrics ? (
              // Show all metrics for current month
              [
                { label: "Open Files", value: totalSummary.open, color: "from-cyan-500 to-blue-500", accent: "cyan" },
                {
                  label: "Closed Files",
                  value: totalSummary.closed,
                  color: "from-emerald-500 to-green-500",
                  accent: "emerald",
                },
                {
                  label: "Withdrawn Files",
                  value: totalSummary.withdrawn,
                  color: "from-red-500 to-pink-500",
                  accent: "red",
                },
                {
                  label: "Total Files",
                  value: totalSummary.total,
                  color: "from-purple-500 to-violet-500",
                  accent: "purple",
                },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    className={`${
                      isDarkMode
                        ? "bg-slate-900/40 border-slate-700/50 hover:border-slate-600/70 shadow-lg"
                        : "bg-white/60 border-gray-300/40 hover:border-gray-400/60 shadow-lg"
                    } backdrop-blur-xl transition-all duration-300 hover:shadow-xl`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{metric.label}</p>
                          <p
                            className={`text-2xl font-bold ${
                              isDarkMode
                                ? "bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                                : "text-gray-900"
                            }`}
                          >
                            {metric.value.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-r ${metric.color} ${
                            isDarkMode ? "opacity-20" : "opacity-30"
                          } animate-pulse`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              // Show only total for historical months
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className="max-w-md mx-auto"
              >
                <Card
                  className={`${
                    isDarkMode
                      ? "bg-slate-900/40 border-slate-700/50 hover:border-slate-600/70 shadow-lg"
                      : "bg-white/60 border-gray-300/40 hover:border-gray-400/60 shadow-lg"
                  } backdrop-blur-xl transition-all duration-300 hover:shadow-xl`}
                >
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"} mb-2`}>Total Files</p>
                      <p
                        className={`text-4xl font-bold ${
                          isDarkMode
                            ? "bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                            : "text-gray-900"
                        }`}
                      >
                        {totalSummary.total.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* US Map - Full Width Section */}
        <motion.div
          className="relative z-10 w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="container mx-auto px-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-2xl font-bold ${
                  isDarkMode
                    ? "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                    : "text-gray-900"
                }`}
              >
                United States File Volume Map
              </h2>
              <Badge
                variant="outline"
                className={`${isDarkMode ? "border-cyan-500/30 text-cyan-300" : "border-blue-400/50 text-blue-600"}`}
              >
                Click states to add to watchlist
              </Badge>
            </div>
          </div>

          <div className="w-full h-[600px] relative">
            <USMap
              data={currentData}
              onStateClick={handleStateClick}
              onStateHover={setHoveredState}
              getStateIntensity={getStateIntensity}
              filteredStates={filteredStates}
              hoveredState={hoveredState}
              isDarkMode={isDarkMode}
            />
          </div>
        </motion.div>

        {/* State Cards Section */}
        <div className="relative z-10 container mx-auto px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2
                className={`text-3xl font-bold ${
                  isDarkMode
                    ? "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                    : "text-gray-900"
                }`}
              >
                State Watchlist
              </h2>
              <Badge
                variant="outline"
                className={`${
                  isDarkMode ? "border-purple-500/30 text-purple-300" : "border-purple-400/50 text-purple-600"
                }`}
              >
                {selectedStates.length} selected
              </Badge>
            </div>

            <div className="space-y-6 max-h-[800px] overflow-y-auto">
              <AnimatePresence>
                {selectedStates.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-20"
                  >
                    <Card
                      className={`${
                        isDarkMode ? "bg-slate-900/40 border-cyan-500/20" : "bg-white/60 border-blue-300/40"
                      } backdrop-blur-xl max-w-md`}
                    >
                      <CardContent className="p-8 text-center">
                        <div
                          className={`w-20 h-20 mx-auto mb-4 rounded-full ${
                            isDarkMode
                              ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20"
                              : "bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                          } flex items-center justify-center`}
                        >
                          <MapPin className={`w-10 h-10 ${isDarkMode ? "text-cyan-400" : "text-blue-500"}`} />
                        </div>
                        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          No States Selected
                        </h3>
                        <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Click on states in the map above to add them to your watchlist and view detailed analytics.
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedStates.map((stateCode, index) => (
                      <StateCard
                        key={stateCode}
                        stateCode={stateCode}
                        data={currentData[stateCode]}
                        index={index}
                        onRemove={() => handleRemoveState(stateCode)}
                        getTrendIcon={getTrendIcon}
                        isDarkMode={isDarkMode}
                        selectedMonth={selectedMonth}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Tooltip for hovered state */}
        {hoveredState && currentData[hoveredState] && (
          <motion.div
            className={`fixed pointer-events-none z-50 ${
              isDarkMode
                ? "bg-slate-900/95 border-cyan-500/30 shadow-cyan-500/20"
                : "bg-white/95 border-blue-400/40 shadow-blue-400/20"
            } backdrop-blur-xl border rounded-xl p-4 shadow-2xl`}
            style={{
              left: "50%",
              top: "40%",
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
          >
            <h3
              className={`font-semibold mb-3 text-lg ${
                isDarkMode
                  ? "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                  : "text-gray-900"
              }`}
            >
              {hoveredState}
            </h3>
            <div className="space-y-2 text-sm">
              {showBreakdownMetrics && (
                <>
                  <div className="flex justify-between gap-6">
                    <span className={`${isDarkMode ? "text-cyan-300" : "text-blue-600"}`}>Open:</span>
                    <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {currentData[hoveredState].open.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className={`${isDarkMode ? "text-emerald-300" : "text-emerald-600"}`}>Closed:</span>
                    <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {currentData[hoveredState].closed.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-6">
                    <span className={`${isDarkMode ? "text-red-300" : "text-red-600"}`}>Withdrawn:</span>
                    <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {currentData[hoveredState].withdrawn.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between gap-6 pt-2 border-t ${
                      isDarkMode ? "border-white/20" : "border-gray-300"
                    }`}
                  >
                    <span className={`font-semibold ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}>
                      Total:
                    </span>
                    <span className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {currentData[hoveredState].total.toLocaleString()}
                    </span>
                  </div>
                </>
              )}
              {!showBreakdownMetrics && (
                <div className="flex justify-between gap-6">
                  <span className={`font-semibold ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}>Total:</span>
                  <span className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {currentData[hoveredState].total.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  )
}
