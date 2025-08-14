"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface USMapProps {
  data: Record<string, any>
  onStateClick: (stateCode: string) => void
  onStateHover: (stateCode: string | null) => void
  getStateIntensity: (stateCode: string) => number
  filteredStates: string[]
  hoveredState: string | null
  isDarkMode: boolean
}

// Grid layout positions for states (row, column) - geographical positioning
const statePositions: Record<string, { row: number; col: number }> = {
  // Row 0 (northernmost)
  AK: { row: 0, col: 0 }, // Alaska (far left)
  ME: { row: 0, col: 10 },

  // Row 1
  WA: { row: 1, col: 1 },
  MT: { row: 1, col: 3 },
  ND: { row: 1, col: 4 },
  MN: { row: 1, col: 5 },
  NY: { row: 1, col: 8 },
  VT: { row: 1, col: 9 },
  NH: { row: 1, col: 10 },
  MA: { row: 1, col: 11 },

  // Row 2
  OR: { row: 2, col: 1 },
  ID: { row: 2, col: 2 },
  WY: { row: 2, col: 3 },
  SD: { row: 2, col: 4 },
  WI: { row: 2, col: 5 },
  MI: { row: 2, col: 6 },
  OH: { row: 2, col: 7 },
  PA: { row: 2, col: 8 },
  NJ: { row: 2, col: 9 },
  CT: { row: 2, col: 10 },
  RI: { row: 2, col: 11 },

  // Row 3
  CA: { row: 3, col: 1 },
  NV: { row: 3, col: 2 },
  UT: { row: 3, col: 3 },
  CO: { row: 3, col: 4 },
  IA: { row: 3, col: 5 },
  IL: { row: 3, col: 6 },
  IN: { row: 3, col: 7 },
  WV: { row: 3, col: 8 },
  VA: { row: 3, col: 9 },
  MD: { row: 3, col: 10 },
  DE: { row: 3, col: 11 },

  // Row 4
  AZ: { row: 4, col: 2 },
  NE: { row: 4, col: 4 },
  KS: { row: 4, col: 4 },
  MO: { row: 4, col: 5 },
  KY: { row: 4, col: 7 },
  NC: { row: 4, col: 9 },
  DC: { row: 4, col: 10 }, // Washington DC

  // Row 5
  NM: { row: 5, col: 3 },
  OK: { row: 5, col: 4 },
  AR: { row: 5, col: 5 },
  TN: { row: 5, col: 6 },
  SC: { row: 5, col: 9 },

  // Row 6
  TX: { row: 6, col: 4 },
  LA: { row: 6, col: 5 },
  MS: { row: 6, col: 6 },
  AL: { row: 6, col: 7 },
  GA: { row: 6, col: 8 },

  // Row 7 (southernmost)
  HI: { row: 7, col: 0 }, // Hawaii (far left, bottom)
  FL: { row: 7, col: 9 },
}

export function USMap({
  data,
  onStateClick,
  onStateHover,
  getStateIntensity,
  filteredStates,
  hoveredState,
  isDarkMode,
}: USMapProps) {
  const [clickedStates, setClickedStates] = useState<Set<string>>(new Set())

  const getStateColor = (stateCode: string) => {
    if (!filteredStates.includes(stateCode)) {
      return isDarkMode ? "bg-slate-700/40" : "bg-gray-400/40"
    }

    const intensity = getStateIntensity(stateCode)
    if (intensity > 80) return "bg-gradient-to-br from-red-500 to-pink-600"
    if (intensity > 60) return "bg-gradient-to-br from-orange-500 to-red-500"
    if (intensity > 40) return "bg-gradient-to-br from-yellow-500 to-orange-500"
    if (intensity > 20) return "bg-gradient-to-br from-emerald-500 to-green-500"
    return "bg-gradient-to-br from-cyan-500 to-blue-500"
  }

  const getGlowEffect = (stateCode: string) => {
    if (!filteredStates.includes(stateCode)) return ""

    const intensity = getStateIntensity(stateCode)
    if (intensity > 80) return "shadow-red-500/50"
    if (intensity > 60) return "shadow-orange-500/50"
    if (intensity > 40) return "shadow-yellow-500/50"
    if (intensity > 20) return "shadow-emerald-500/50"
    return "shadow-cyan-500/50"
  }

  const handleStateClick = (stateCode: string) => {
    onStateClick(stateCode)
    setClickedStates((prev) => new Set([...prev, stateCode]))
  }

  // Create grid layout
  const maxRow = Math.max(...Object.values(statePositions).map((pos) => pos.row))
  const maxCol = Math.max(...Object.values(statePositions).map((pos) => pos.col))

  const gridItems = []
  for (let row = 0; row <= maxRow; row++) {
    for (let col = 0; col <= maxCol; col++) {
      const stateCode = Object.keys(statePositions).find(
        (state) => statePositions[state].row === row && statePositions[state].col === col,
      )

      if (stateCode && data[stateCode]) {
        gridItems.push(
          <StateCard
            key={stateCode}
            stateCode={stateCode}
            data={data[stateCode]}
            color={getStateColor(stateCode)}
            glowEffect={getGlowEffect(stateCode)}
            isHovered={hoveredState === stateCode}
            isClicked={clickedStates.has(stateCode)}
            onClick={() => handleStateClick(stateCode)}
            onHover={() => onStateHover(stateCode)}
            onLeave={() => onStateHover(null)}
            isDarkMode={isDarkMode}
            row={row}
            col={col}
          />,
        )
      } else {
        // Empty grid cell
        gridItems.push(
          <div key={`empty-${row}-${col}`} className="w-12 h-12" style={{ gridRow: row + 1, gridColumn: col + 1 }} />,
        )
      }
    }
  }

  return (
    <motion.div
      className={`w-full ${isDarkMode ? "bg-slate-900/20" : "bg-white/20"} backdrop-blur-xl rounded-2xl border ${isDarkMode ? "border-cyan-500/20" : "border-blue-300/40"} shadow-2xl overflow-hidden relative p-8`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      <div
        className="grid gap-2 justify-center mx-auto"
        style={{
          gridTemplateRows: `repeat(${maxRow + 1}, 48px)`,
          gridTemplateColumns: `repeat(${maxCol + 1}, 48px)`,
          width: "fit-content",
        }}
      >
        {gridItems}
      </div>
    </motion.div>
  )
}

interface StateCardProps {
  stateCode: string
  data: any
  color: string
  glowEffect: string
  isHovered: boolean
  isClicked: boolean
  onClick: () => void
  onHover: () => void
  onLeave: () => void
  isDarkMode: boolean
  row: number
  col: number
}

function StateCard({
  stateCode,
  data,
  color,
  glowEffect,
  isHovered,
  isClicked,
  onClick,
  onHover,
  onLeave,
  isDarkMode,
  row,
  col,
}: StateCardProps) {
  return (
    <motion.div
      className={`
        w-12 h-12 rounded-lg cursor-pointer relative overflow-hidden
        ${color}
        ${isHovered ? `shadow-lg ${glowEffect}` : "shadow-md"}
        ${isClicked ? "ring-2 ring-white ring-opacity-60" : ""}
        transition-all duration-300 ease-out
        hover:scale-110 hover:z-10
        flex items-center justify-center
        border border-white/20
      `}
      style={{ gridRow: row + 1, gridColumn: col + 1 }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      whileHover={{
        scale: 1.15,
        boxShadow: isHovered ? "0 0 20px rgba(34,211,238,0.6)" : "0 0 15px rgba(0,0,0,0.3)",
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: (row + col) * 0.02,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* Pulse effect for high-intensity states */}
      {data.total > 1500 && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-white/20"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      )}

      {/* State abbreviation */}
      <span className="text-white font-bold text-xs drop-shadow-lg">{stateCode}</span>

      {/* Tooltip */}
      {isHovered && (
        <motion.div
          className={`absolute z-50 ${isDarkMode ? "bg-slate-900/95" : "bg-white/95"} backdrop-blur-xl border ${isDarkMode ? "border-cyan-500/30" : "border-blue-400/40"} rounded-lg p-3 shadow-2xl pointer-events-none`}
          style={{
            bottom: "120%",
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: "180px",
          }}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <h3 className={`font-bold mb-2 ${isDarkMode ? "text-cyan-400" : "text-blue-600"}`}>
              {stateCode} - {data.region}
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-cyan-500">Open:</span>
                <span className="font-medium">{data.open.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-500">Closed:</span>
                <span className="font-medium">{data.closed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-500">Withdrawn:</span>
                <span className="font-medium">{data.withdrawn.toLocaleString()}</span>
              </div>
              <div
                className={`flex justify-between pt-1 border-t ${isDarkMode ? "border-white/20" : "border-gray-300"}`}
              >
                <span className="font-bold text-purple-500">Total:</span>
                <span className="font-bold">{data.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Tooltip arrow */}
          <div
            className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${isDarkMode ? "border-t-slate-900/95" : "border-t-white/95"}`}
          />
        </motion.div>
      )}
    </motion.div>
  )
}
