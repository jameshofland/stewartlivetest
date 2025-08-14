"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface TrendlineChartProps {
  companyData: Array<{
    week: string
    score: number
    annotation?: string
  }>
  stateData: Record<string, Array<{ week: string; score: number }>>
}

export function TrendlineChart({ companyData, stateData }: TrendlineChartProps) {
  // Generate chart-friendly data combining company + state scores per week
  const chartData = companyData.map((companyPoint) => {
    const dataPoint: any = {
      week: companyPoint.week,
      company: companyPoint.score,
      annotation: companyPoint.annotation,
    }

    Object.entries(stateData).forEach(([stateName, statePoints]) => {
      const statePoint = statePoints.find((point) => point.week === companyPoint.week)
      if (statePoint) {
        dataPoint[stateName] = statePoint.score
      }
    })

    return dataPoint
  })

  const stateColors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // yellow
    "#8b5cf6", // purple
    "#06b6d4", // cyan
    "#f97316", // orange
    "#84cc16", // lime
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const companyData = payload.find((p: any) => p.dataKey === "company")
      const annotation = companyData?.payload?.annotation

      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900">{`Week ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey === "company" ? "Company Average" : entry.dataKey}: ${entry.value}`}
            </p>
          ))}
          {annotation && (
            <p className="text-xs text-slate-500 mt-2 italic border-t pt-2">{annotation}</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[400px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
          <YAxis domain={[40, 100]} stroke="#64748b" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Company Average - always shown */}
          <Line
            type="monotone"
            dataKey="company"
            stroke="#1e293b"
            strokeWidth={3}
            dot={{ fill: "#1e293b", strokeWidth: 2, r: 4 }}
            name="Company Average"
          />

          {/* State lines */}
          {Object.entries(stateData).map(([stateName], index) => (
            <Line
              key={stateName}
              type="monotone"
              dataKey={stateName}
              stroke={stateColors[index % stateColors.length]}
              strokeWidth={2}
              dot={{ fill: stateColors[index % stateColors.length], strokeWidth: 2, r: 3 }}
              name={stateName}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Empty state message */}
      {Object.keys(stateData).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="text-center text-slate-500">
            <p className="text-sm">Select states on the map to compare trends</p>
          </div>
        </div>
      )}
    </div>
  )
}
