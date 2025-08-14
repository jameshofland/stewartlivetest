"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StateCardProps {
  stateName: string
  currentScore: number
  sentimentSummary: string
  onRemove: () => void
}

export function StateCard({ stateName, currentScore, sentimentSummary, onRemove }: StateCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 70) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Excellent</Badge>
    } else if (score >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Good</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Needs Improvement</Badge>
    }
  }

  const getTrendIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (score >= 50) return <Minus className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">{stateName}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 hover:bg-slate-100"
            aria-label={`Remove ${stateName} from comparison`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${getScoreColor(currentScore)}`}>{currentScore}</span>
            {getTrendIcon(currentScore)}
          </div>
          {getScoreBadge(currentScore)}
        </div>

        {/* Sentiment Summary */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-2">Key Insights</h4>
          <p className="text-sm text-slate-600 leading-relaxed">{sentimentSummary}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="text-xs text-slate-500">Promoters</div>
            <div className="text-sm font-semibold text-green-600">
              {currentScore >= 70 ? "High" : currentScore >= 50 ? "Medium" : "Low"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">Passives</div>
            <div className="text-sm font-semibold text-yellow-600">
              {currentScore >= 70 ? "Low" : currentScore >= 50 ? "Medium" : "High"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500">Detractors</div>
            <div className="text-sm font-semibold text-red-600">
              {currentScore >= 70 ? "Low" : currentScore >= 50 ? "Medium" : "High"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
