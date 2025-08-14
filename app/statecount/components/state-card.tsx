"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { X } from "lucide-react"

interface StateCardProps {
  stateCode: string
  data: any
  index: number
  onRemove: () => void
  getTrendIcon: (change: number) => React.ReactNode
  isDarkMode: boolean
  selectedMonth: string
}

export function StateCard({
  stateCode,
  data,
  index,
  onRemove,
  getTrendIcon,
  isDarkMode,
  selectedMonth,
}: StateCardProps) {
  const showBreakdownMetrics = selectedMonth === "current"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        className={`${
          isDarkMode
            ? "bg-slate-900/60 border-slate-700/50 hover:border-slate-600/70"
            : "bg-white/80 border-gray-300/50 hover:border-gray-400/70"
        } backdrop-blur-xl transition-all duration-300 shadow-lg hover:shadow-xl relative`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle
              className={`text-lg font-bold ${
                isDarkMode
                  ? "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                  : "text-gray-900"
              }`}
            >
              {stateCode}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className={`h-6 w-6 p-0 ${
                isDarkMode
                  ? "text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                  : "text-gray-500 hover:text-red-500 hover:bg-red-100"
              }`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Badge
            variant="outline"
            className={`w-fit ${
              isDarkMode ? "border-purple-500/30 text-purple-300" : "border-purple-400/50 text-purple-600"
            }`}
          >
            {data.region}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {showBreakdownMetrics ? (
            // Show detailed breakdown for current month
            <>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    isDarkMode ? "bg-cyan-500/10 border border-cyan-500/20" : "bg-cyan-50 border border-cyan-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${isDarkMode ? "text-cyan-300" : "text-cyan-700"}`}>
                      Open
                    </span>
                    {getTrendIcon(data.openChange)}
                  </div>
                  <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {data.open.toLocaleString()}
                  </p>
                  {data.openChange !== 0 && (
                    <p
                      className={`text-xs ${
                        data.openChange > 0
                          ? "text-emerald-400"
                          : data.openChange < 0
                            ? "text-red-400"
                            : "text-gray-400"
                      }`}
                    >
                      {data.openChange > 0 ? "+" : ""}
                      {data.openChange}%
                    </p>
                  )}
                </div>

                <div
                  className={`p-3 rounded-lg ${
                    isDarkMode
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-emerald-50 border border-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                      Closed
                    </span>
                    {getTrendIcon(data.closedChange)}
                  </div>
                  <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {data.closed.toLocaleString()}
                  </p>
                  {data.closedChange !== 0 && (
                    <p
                      className={`text-xs ${
                        data.closedChange > 0
                          ? "text-emerald-400"
                          : data.closedChange < 0
                            ? "text-red-400"
                            : "text-gray-400"
                      }`}
                    >
                      {data.closedChange > 0 ? "+" : ""}
                      {data.closedChange}%
                    </p>
                  )}
                </div>

                <div
                  className={`p-3 rounded-lg ${
                    isDarkMode ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${isDarkMode ? "text-red-300" : "text-red-700"}`}>
                      Withdrawn
                    </span>
                    {getTrendIcon(data.withdrawnChange)}
                  </div>
                  <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {data.withdrawn.toLocaleString()}
                  </p>
                  {data.withdrawnChange !== 0 && (
                    <p
                      className={`text-xs ${
                        data.withdrawnChange > 0
                          ? "text-emerald-400"
                          : data.withdrawnChange < 0
                            ? "text-red-400"
                            : "text-gray-400"
                      }`}
                    >
                      {data.withdrawnChange > 0 ? "+" : ""}
                      {data.withdrawnChange}%
                    </p>
                  )}
                </div>

                <div
                  className={`p-3 rounded-lg ${
                    isDarkMode
                      ? "bg-purple-500/10 border border-purple-500/20"
                      : "bg-purple-50 border border-purple-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}>
                      Total
                    </span>
                    {getTrendIcon(data.totalChange)}
                  </div>
                  <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {data.total.toLocaleString()}
                  </p>
                  {data.totalChange !== 0 && (
                    <p
                      className={`text-xs ${
                        data.totalChange > 0
                          ? "text-emerald-400"
                          : data.totalChange < 0
                            ? "text-red-400"
                            : "text-gray-400"
                      }`}
                    >
                      {data.totalChange > 0 ? "+" : ""}
                      {data.totalChange}%
                    </p>
                  )}
                </div>
              </div>

              {/* Comparison metrics */}
              <div className="space-y-2 pt-2 border-t border-gray-200/20">
                {data.previousMonthChange !== null && (
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>vs Last Month:</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(data.previousMonthChange)}
                      <span
                        className={`text-xs font-medium ${
                          data.previousMonthChange > 0
                            ? "text-emerald-400"
                            : data.previousMonthChange < 0
                              ? "text-red-400"
                              : "text-gray-400"
                        }`}
                      >
                        {data.previousMonthChange > 0 ? "+" : ""}
                        {data.previousMonthChange}%
                      </span>
                    </div>
                  </div>
                )}

                {data.yearOverYearChange !== null && (
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>vs Last Year:</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(data.yearOverYearChange)}
                      <span
                        className={`text-xs font-medium ${
                          data.yearOverYearChange > 0
                            ? "text-emerald-400"
                            : data.yearOverYearChange < 0
                              ? "text-red-400"
                              : "text-gray-400"
                        }`}
                      >
                        {data.yearOverYearChange > 0 ? "+" : ""}
                        {data.yearOverYearChange}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Show only total for historical months
            <div
              className={`p-4 rounded-lg text-center ${
                isDarkMode ? "bg-purple-500/10 border border-purple-500/20" : "bg-purple-50 border border-purple-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className={`text-sm font-medium ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}>
                  Total Files
                </span>
                {getTrendIcon(data.totalChange)}
              </div>
              <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {data.total.toLocaleString()}
              </p>
              {data.totalChange !== 0 && (
                <p
                  className={`text-sm mt-1 ${
                    data.totalChange > 0 ? "text-emerald-400" : data.totalChange < 0 ? "text-red-400" : "text-gray-400"
                  }`}
                >
                  {data.totalChange > 0 ? "+" : ""}
                  {data.totalChange}% from previous
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
