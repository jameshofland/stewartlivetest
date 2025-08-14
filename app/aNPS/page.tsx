"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HomeButton } from "@/components/navigation"
import { MapComponent } from "./components/map-component"
import { DataTable } from "./components/data-table"
import { StateCard } from "./components/state-card"
import { TrendlineChart } from "./components/trendline-chart"

// Comprehensive sample data for all dashboard components
const mockData = {
  stateScores: {
    California: 72,
    Texas: 68,
    Florida: 75,
    "New York": 65,
    Illinois: 70,
    Pennsylvania: 73,
    Ohio: 69,
    Georgia: 71,
    "North Carolina": 74,
    Michigan: 67,
    Virginia: 76,
    Washington: 78,
    Arizona: 66,
    Massachusetts: 77,
    Tennessee: 64,
    Indiana: 68,
    Missouri: 63,
    Maryland: 75,
    Wisconsin: 69,
    Colorado: 73,
    Minnesota: 71,
    Louisiana: 62,
    Alabama: 65,
    Kentucky: 67,
    Oregon: 74,
    Oklahoma: 61,
    Connecticut: 76,
    Utah: 72,
    Iowa: 68,
    Nevada: 70,
    Arkansas: 59,
    Mississippi: 58,
    Kansas: 66,
    "New Mexico": 64,
    Nebraska: 67,
    "West Virginia": 60,
    Idaho: 69,
    Hawaii: 79,
    "New Hampshire": 75,
    Maine: 73,
    Montana: 65,
    "Rhode Island": 74,
    Delaware: 72,
    "South Dakota": 66,
    "North Dakota": 68,
    Alaska: 71,
    Vermont: 77,
    Wyoming: 63,
  },
  weeklyTrends: {
    company: [
      { week: "W1", score: 68, annotation: "Holiday season impact" },
      { week: "W2", score: 70, annotation: "" },
      { week: "W3", score: 69, annotation: "System maintenance" },
      { week: "W4", score: 71, annotation: "" },
      { week: "W5", score: 73, annotation: "New training program" },
      { week: "W6", score: 72, annotation: "" },
      { week: "W7", score: 74, annotation: "" },
      { week: "W8", score: 73, annotation: "" },
      { week: "W9", score: 75, annotation: "Process improvements" },
      { week: "W10", score: 74, annotation: "" },
      { week: "W11", score: 76, annotation: "" },
      { week: "W12", score: 75, annotation: "" },
    ],
    California: [
      { week: "W1", score: 70 },
      { week: "W2", score: 72 },
      { week: "W3", score: 71 },
      { week: "W4", score: 73 },
      { week: "W5", score: 75 },
      { week: "W6", score: 72 },
      { week: "W7", score: 74 },
      { week: "W8", score: 73 },
      { week: "W9", score: 76 },
      { week: "W10", score: 75 },
      { week: "W11", score: 77 },
      { week: "W12", score: 72 },
    ],
    Texas: [
      { week: "W1", score: 65 },
      { week: "W2", score: 67 },
      { week: "W3", score: 66 },
      { week: "W4", score: 69 },
      { week: "W5", score: 70 },
      { week: "W6", score: 68 },
      { week: "W7", score: 69 },
      { week: "W8", score: 67 },
      { week: "W9", score: 71 },
      { week: "W10", score: 70 },
      { week: "W11", score: 72 },
      { week: "W12", score: 68 },
    ],
    Florida: [
      { week: "W1", score: 73 },
      { week: "W2", score: 75 },
      { week: "W3", score: 74 },
      { week: "W4", score: 76 },
      { week: "W5", score: 78 },
      { week: "W6", score: 75 },
      { week: "W7", score: 77 },
      { week: "W8", score: 76 },
      { week: "W9", score: 79 },
      { week: "W10", score: 78 },
      { week: "W11", score: 80 },
      { week: "W12", score: 75 },
    ],
    "New York": [
      { week: "W1", score: 63 },
      { week: "W2", score: 65 },
      { week: "W3", score: 64 },
      { week: "W4", score: 66 },
      { week: "W5", score: 68 },
      { week: "W6", score: 65 },
      { week: "W7", score: 67 },
      { week: "W8", score: 66 },
      { week: "W9", score: 69 },
      { week: "W10", score: 68 },
      { week: "W11", score: 70 },
      { week: "W12", score: 65 },
    ],
    Illinois: [
      { week: "W1", score: 68 },
      { week: "W2", score: 70 },
      { week: "W3", score: 69 },
      { week: "W4", score: 71 },
      { week: "W5", score: 73 },
      { week: "W6", score: 70 },
      { week: "W7", score: 72 },
      { week: "W8", score: 71 },
      { week: "W9", score: 74 },
      { week: "W10", score: 73 },
      { week: "W11", score: 75 },
      { week: "W12", score: 70 },
    ],
    Washington: [
      { week: "W1", score: 76 },
      { week: "W2", score: 78 },
      { week: "W3", score: 77 },
      { week: "W4", score: 79 },
      { week: "W5", score: 81 },
      { week: "W6", score: 78 },
      { week: "W7", score: 80 },
      { week: "W8", score: 79 },
      { week: "W9", score: 82 },
      { week: "W10", score: 81 },
      { week: "W11", score: 83 },
      { week: "W12", score: 78 },
    ],
  },
  rawData: [
    // California agents
    {
      state: "California",
      agentName: "John Smith",
      score: 9,
      comment: "Excellent service, very responsive and professional throughout the entire process.",
    },
    {
      state: "California",
      agentName: "Sarah Johnson",
      score: 8,
      comment: "Good communication throughout, kept me informed at every step.",
    },
    {
      state: "California",
      agentName: "Michael Chen",
      score: 10,
      comment: "Outstanding experience! Went above and beyond expectations.",
    },
    {
      state: "California",
      agentName: "Lisa Rodriguez",
      score: 7,
      comment: "Professional service, though response time could be improved.",
    },
    {
      state: "California",
      agentName: "David Kim",
      score: 9,
      comment: "Highly knowledgeable and made the process seamless.",
    },
    {
      state: "California",
      agentName: "Jennifer Wong",
      score: 8,
      comment: "Great attention to detail and very thorough.",
    },

    // Texas agents
    {
      state: "Texas",
      agentName: "Mike Wilson",
      score: 7,
      comment: "Process was smooth but took longer than expected.",
    },
    {
      state: "Texas",
      agentName: "Lisa Brown",
      score: 6,
      comment: "Some communication delays, but ultimately got the job done.",
    },
    {
      state: "Texas",
      agentName: "Robert Garcia",
      score: 8,
      comment: "Professional and knowledgeable about local market conditions.",
    },
    {
      state: "Texas",
      agentName: "Amanda Martinez",
      score: 5,
      comment: "Average service, felt like just another transaction.",
    },
    {
      state: "Texas",
      agentName: "James Thompson",
      score: 9,
      comment: "Exceeded my expectations with personalized service.",
    },
    {
      state: "Texas",
      agentName: "Maria Gonzalez",
      score: 7,
      comment: "Good overall experience with minor hiccups along the way.",
    },

    // Florida agents
    {
      state: "Florida",
      agentName: "David Lee",
      score: 9,
      comment: "Outstanding experience, highly recommend to anyone!",
    },
    {
      state: "Florida",
      agentName: "Jennifer Martinez",
      score: 10,
      comment: "Perfect transaction from start to finish.",
    },
    { state: "Florida", agentName: "Carlos Ruiz", score: 8, comment: "Very helpful and always available when needed." },
    {
      state: "Florida",
      agentName: "Nicole Taylor",
      score: 9,
      comment: "Professional, efficient, and genuinely cared about my needs.",
    },
    {
      state: "Florida",
      agentName: "Steven Adams",
      score: 7,
      comment: "Good service overall, minor issues with documentation.",
    },
    {
      state: "Florida",
      agentName: "Rachel Green",
      score: 10,
      comment: "Absolutely fantastic! Made everything so easy.",
    },

    // New York agents
    {
      state: "New York",
      agentName: "Emily Davis",
      score: 5,
      comment: "Average service, room for improvement in communication.",
    },
    {
      state: "New York",
      agentName: "Christopher Taylor",
      score: 7,
      comment: "Decent service overall, but felt rushed at times.",
    },
    {
      state: "New York",
      agentName: "Michelle Wang",
      score: 6,
      comment: "Okay experience, expected more personalized attention.",
    },
    {
      state: "New York",
      agentName: "Daniel Rodriguez",
      score: 4,
      comment: "Disappointing service, many delays and poor communication.",
    },
    {
      state: "New York",
      agentName: "Ashley Johnson",
      score: 8,
      comment: "Good experience despite the challenging market conditions.",
    },
    {
      state: "New York",
      agentName: "Kevin O'Brien",
      score: 6,
      comment: "Average performance, nothing exceptional but got the job done.",
    },

    // Illinois agents
    {
      state: "Illinois",
      agentName: "Amanda Rodriguez",
      score: 8,
      comment: "Very helpful and professional throughout.",
    },
    { state: "Illinois", agentName: "Brian Murphy", score: 7, comment: "Good service with clear communication." },
    { state: "Illinois", agentName: "Stephanie Lee", score: 9, comment: "Excellent knowledge of the local market." },
    { state: "Illinois", agentName: "Mark Johnson", score: 6, comment: "Adequate service, could be more proactive." },
    {
      state: "Illinois",
      agentName: "Laura Chen",
      score: 8,
      comment: "Professional and responsive to all my questions.",
    },

    // Washington agents
    {
      state: "Washington",
      agentName: "Ryan Mitchell",
      score: 10,
      comment: "Absolutely incredible service! Best agent I've ever worked with.",
    },
    {
      state: "Washington",
      agentName: "Samantha Davis",
      score: 9,
      comment: "Exceptional attention to detail and customer service.",
    },
    {
      state: "Washington",
      agentName: "Alex Thompson",
      score: 8,
      comment: "Very knowledgeable about the Seattle market.",
    },
    {
      state: "Washington",
      agentName: "Jessica Park",
      score: 9,
      comment: "Made the entire process stress-free and enjoyable.",
    },
    {
      state: "Washington",
      agentName: "Tyler Anderson",
      score: 7,
      comment: "Good service, though availability was sometimes limited.",
    },

    // Pennsylvania agents
    {
      state: "Pennsylvania",
      agentName: "James Anderson",
      score: 9,
      comment: "Exceeded expectations with personalized service.",
    },
    {
      state: "Pennsylvania",
      agentName: "Karen Wilson",
      score: 8,
      comment: "Professional and knowledgeable about local regulations.",
    },
    {
      state: "Pennsylvania",
      agentName: "Thomas Brown",
      score: 7,
      comment: "Solid performance with good market insights.",
    },

    // Ohio agents
    { state: "Ohio", agentName: "Maria Gonzalez", score: 7, comment: "Good service with minor issues along the way." },
    {
      state: "Ohio",
      agentName: "Robert Taylor",
      score: 6,
      comment: "Average experience, could improve response times.",
    },
    { state: "Ohio", agentName: "Linda Martinez", score: 8, comment: "Very thorough and detail-oriented." },

    // Georgia agents
    { state: "Georgia", agentName: "William Thompson", score: 8, comment: "Smooth process with great communication." },
    { state: "Georgia", agentName: "Patricia Davis", score: 7, comment: "Good overall service with helpful guidance." },
    { state: "Georgia", agentName: "Charles Wilson", score: 9, comment: "Outstanding local market knowledge." },

    // North Carolina agents
    {
      state: "North Carolina",
      agentName: "Jessica White",
      score: 9,
      comment: "Highly professional and efficient service.",
    },
    {
      state: "North Carolina",
      agentName: "Matthew Johnson",
      score: 8,
      comment: "Great communication and follow-through.",
    },
    {
      state: "North Carolina",
      agentName: "Sarah Miller",
      score: 7,
      comment: "Good service with helpful market insights.",
    },

    // Michigan agents
    { state: "Michigan", agentName: "Daniel Harris", score: 6, comment: "Service was okay, could be more responsive." },
    {
      state: "Michigan",
      agentName: "Jennifer Clark",
      score: 7,
      comment: "Decent experience with good local knowledge.",
    },
    {
      state: "Michigan",
      agentName: "Michael Lewis",
      score: 8,
      comment: "Professional service with attention to detail.",
    },

    // Additional states for more comprehensive data
    {
      state: "Virginia",
      agentName: "Elizabeth Moore",
      score: 9,
      comment: "Exceptional service with great market expertise.",
    },
    {
      state: "Arizona",
      agentName: "Christopher Lee",
      score: 6,
      comment: "Average service, communication could be better.",
    },
    {
      state: "Massachusetts",
      agentName: "Rebecca Taylor",
      score: 9,
      comment: "Outstanding professionalism and knowledge.",
    },
    { state: "Tennessee", agentName: "Joshua Brown", score: 5, comment: "Below average experience, many delays." },
    {
      state: "Colorado",
      agentName: "Michelle Garcia",
      score: 8,
      comment: "Great service with excellent local insights.",
    },
    {
      state: "Oregon",
      agentName: "Andrew Wilson",
      score: 8,
      comment: "Very helpful and knowledgeable about Portland market.",
    },
    {
      state: "Utah",
      agentName: "Stephanie Davis",
      score: 7,
      comment: "Good service overall with minor communication issues.",
    },
    {
      state: "Nevada",
      agentName: "Brandon Martinez",
      score: 7,
      comment: "Solid performance with good market knowledge.",
    },
  ],
  sentimentSummaries: {
    California:
      "Promoters consistently praise quick response times, professional service, and deep market knowledge. Agents excel at communication and going above expectations. Minor concerns include occasional response delays from high-performing agents.",
    Texas:
      "Promoters highlight strong local market expertise and professional demeanor. Passives note good overall service but cite longer processing times. Detractors mention communication gaps and feeling like transactions lack personal attention.",
    Florida:
      "Exceptional performance with promoters emphasizing smooth transactions and outstanding customer service. Agents demonstrate strong attention to detail and genuine care for client needs. Minor documentation issues occasionally noted.",
    "New York":
      "Mixed performance with promoters appreciating market expertise despite challenging conditions. Passives cite adequate but rushed service. Detractors frequently mention poor communication, delays, and lack of personalized attention in the competitive market.",
    Illinois:
      "Strong overall performance with promoters praising local market knowledge and professional communication. Agents show good responsiveness and clear guidance. Some passives note room for more proactive service approaches.",
    Washington:
      "Outstanding performance across all metrics. Promoters consistently highlight exceptional service, attention to detail, and stress-free experiences. Strong market knowledge particularly in Seattle area. Minor availability concerns during peak periods.",
    Pennsylvania:
      "Solid performance with promoters praising personalized service and regulatory knowledge. Agents demonstrate good market insights and professional approach. Consistent service delivery with few negative feedback points.",
    Ohio: "Moderate performance with room for improvement. Promoters appreciate thoroughness and attention to detail. Passives note adequate service but slower response times. Focus needed on improving communication speed and proactive outreach.",
    Georgia:
      "Good performance with promoters highlighting smooth processes and excellent communication. Strong local market knowledge and helpful guidance throughout transactions. Consistent service quality across different agents.",
    "North Carolina":
      "Strong performance with promoters praising efficiency and professionalism. Excellent communication and follow-through on commitments. Good market insights and helpful guidance for clients navigating the local market.",
    Michigan:
      "Below-average performance requiring attention. While some agents show professionalism and local knowledge, overall responsiveness needs improvement. Detractors cite slow communication and lack of proactive service.",
    Virginia:
      "Excellent performance with promoters highlighting exceptional market expertise and service quality. Strong professionalism and attention to client needs. Consistent high-quality service delivery across the region.",
    Arizona:
      "Average performance with mixed feedback. Some agents show good local knowledge, but communication consistency needs improvement. Opportunity to enhance overall service quality and client engagement.",
    Massachusetts:
      "Strong performance with promoters praising outstanding professionalism and deep market knowledge. Agents excel in the competitive Boston market with excellent client service and expertise.",
    Tennessee:
      "Below-average performance requiring immediate attention. Detractors frequently cite delays and communication issues. Need for improved service processes and agent training to meet client expectations.",
    Colorado:
      "Good performance with promoters highlighting excellent local market insights and professional service. Strong knowledge of Denver and surrounding areas. Consistent service quality with good client engagement.",
  },
}

export default function Dashboard() {
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [filteredData, setFilteredData] = useState(mockData.rawData)
  const [filters, setFilters] = useState({
    month: "all",
    region: "all",
    scoreRange: "all",
  })

  const handleStateClick = (stateName: string) => {
    setSelectedStates((prev) => (prev.includes(stateName) ? prev.filter((s) => s !== stateName) : [...prev, stateName]))
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }))
  }

  useEffect(() => {
    // Filter data based on selected states and filters
    let filtered = mockData.rawData

    if (selectedStates.length > 0) {
      filtered = filtered.filter((item) => selectedStates.includes(item.state))
    }

    if (filters.scoreRange !== "all") {
      const [min, max] = filters.scoreRange.split("-").map(Number)
      filtered = filtered.filter((item) => item.score >= min && item.score <= max)
    }

    setFilteredData(filtered)
  }, [selectedStates, filters])

  // Prepare state data for the chart
  const getStateDataForChart = () => {
    const stateData: Record<string, Array<{ week: string; score: number }>> = {}

    selectedStates.forEach((state) => {
      if (mockData.weeklyTrends[state as keyof typeof mockData.weeklyTrends]) {
        stateData[state] = mockData.weeklyTrends[state as keyof typeof mockData.weeklyTrends]
      }
    })

    return stateData
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <HomeButton />

      {/* Header with Filters */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Agent NPS Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="month">Month</Label>
              <Select value={filters.month} onValueChange={(value) => handleFilterChange("month", value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="january">January</SelectItem>
                  <SelectItem value="february">February</SelectItem>
                  <SelectItem value="march">March</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="region">Region</Label>
              <Select value={filters.region} onValueChange={(value) => handleFilterChange("region", value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                  <SelectItem value="east">East</SelectItem>
                  <SelectItem value="south">South</SelectItem>
                  <SelectItem value="midwest">Midwest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="score">Score Range</Label>
              <Select value={filters.scoreRange} onValueChange={(value) => handleFilterChange("scoreRange", value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="9-10">Promoters (9-10)</SelectItem>
                  <SelectItem value="7-8">Passives (7-8)</SelectItem>
                  <SelectItem value="0-6">Detractors (0-6)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Top Section: Map and Trendline Chart Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section - Left Side */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">U.S. Agent NPS by State</CardTitle>
              <p className="text-sm text-slate-600">Click states to compare trends</p>
            </CardHeader>
            <CardContent>
              <MapComponent
                stateScores={mockData.stateScores}
                selectedStates={selectedStates}
                onStateClick={handleStateClick}
              />
            </CardContent>
          </Card>

          {/* Trendline Chart - Right Side */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Weekly aNPS Trends</CardTitle>
              <p className="text-sm text-slate-600">
                {selectedStates.length === 0
                  ? "Company-wide trend shown. Click states on the map to compare individual state performance."
                  : `Comparing ${selectedStates.length} selected state${selectedStates.length > 1 ? "s" : ""} with company average.`}
              </p>
            </CardHeader>
            <CardContent>
              <TrendlineChart companyData={mockData.weeklyTrends.company} stateData={getStateDataForChart()} />
            </CardContent>
          </Card>
        </div>

        {/* State Cards */}
        {selectedStates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedStates.map((state) => (
              <StateCard
                key={state}
                stateName={state}
                currentScore={mockData.stateScores[state as keyof typeof mockData.stateScores] || 0}
                sentimentSummary={
                  mockData.sentimentSummaries[state as keyof typeof mockData.sentimentSummaries] ||
                  "No sentiment data available"
                }
                onRemove={() => handleStateClick(state)}
              />
            ))}
          </div>
        )}

        {/* Raw Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Agent Feedback Data
              {selectedStates.length > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-600">({selectedStates.join(", ")})</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable data={filteredData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
