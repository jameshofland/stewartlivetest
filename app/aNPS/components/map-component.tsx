"use client"

import { useState } from "react"
import USAMap from "react-usa-map"

interface MapComponentProps {
  stateScores: Record<string, number>
  selectedStates: string[]
  onStateClick: (stateName: string) => void
}

export function MapComponent({ stateScores, selectedStates, onStateClick }: MapComponentProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null)

  // Map state abbreviations to full names
  const stateAbbreviationToName: Record<string, string> = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
  }

  const getStateColor = (stateName: string) => {
    const score = stateScores[stateName]
    if (!score) return "#e2e8f0" // Default gray

    if (selectedStates.includes(stateName)) {
      if (score >= 70) return "#059669" // Green-600 (selected)
      if (score >= 50) return "#d97706" // Yellow-600 (selected)
      return "#dc2626" // Red-600 (selected)
    }

    if (score >= 70) return "#10b981" // Green-500
    if (score >= 50) return "#f59e0b" // Yellow-500
    return "#ef4444" // Red-500
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  // Create state config for react-usa-map
const statesCustomConfig = () => {
  const config: Record<string, any> = {}

  Object.entries(stateAbbreviationToName).forEach(([abbr, name]) => {
    config[abbr] = {
      fill: getStateColor(name), // `name` is the full state name here
      clickHandler: (event: any) => {
        event.preventDefault()
        onStateClick(name)
      },
    }
  })

  return config
}

  const mapHandler = (event: any) => {
    const stateAbbr = event.target.dataset.name
    const stateName = stateAbbreviationToName[stateAbbr]

    if (stateName && stateScores[stateName]) {
      setHoveredState(stateName)
    }
  }

  const mapLeaveHandler = () => {
    setHoveredState(null)
  }

  return (
    <div className="relative w-full h-[500px]">
      {/* Map container with proper sizing and centering */}
      <div className="w-full h-full bg-slate-50 rounded-lg border flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-4xl h-full flex items-center justify-center p-4">
          <USAMap
            customize={statesCustomConfig()}
            onMouseOver={mapHandler}
            onMouseOut={mapLeaveHandler}
            width="100%"
            height="100%"
            defaultFill="#e2e8f0"
          />
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredState && stateScores[hoveredState] && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg border z-20 pointer-events-none">
          <div className="font-semibold text-slate-900">{hoveredState}</div>
          <div className={`text-lg font-bold ${getScoreColor(stateScores[hoveredState])}`}>
            aNPS: {stateScores[hoveredState]}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Click to {selectedStates.includes(hoveredState) ? "remove from" : "add to"} comparison
          </div>
        </div>
      )}

      {/* Legend - positioned to not overlap with map */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border z-10 max-w-xs">
        <div className="text-sm font-semibold text-slate-900 mb-2">aNPS Score</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded flex-shrink-0"></div>
            <span>70+ (Excellent)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded flex-shrink-0"></div>
            <span>50-69 (Good)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded flex-shrink-0"></div>
            <span>{"<50"} (Needs Improvement)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-slate-300 rounded flex-shrink-0"></div>
            <span>No Data</span>
          </div>
        </div>

        {selectedStates.length > 0 && (
          <div className="mt-3 pt-2 border-t text-xs text-slate-600">
            <div className="font-medium mb-2">Selected States:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedStates.map((state) => (
                <div key={state} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded flex-shrink-0"
                    style={{ backgroundColor: getStateColor(state) }}
                  ></div>
                  <span className="truncate">{state}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
