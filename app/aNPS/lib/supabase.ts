import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface ANPSData {
  id: number
  state: string
  agent_name: string
  score: number
  comment: string
  created_at: string
  week_of_year: number
  month: number
  year: number
}

export async function fetchANPSData(filters?: {
  states?: string[]
  month?: number
  scoreRange?: [number, number]
}) {
  let query = supabase.from("anps_data").select("*").order("created_at", { ascending: false })

  if (filters?.states && filters.states.length > 0) {
    query = query.in("state", filters.states)
  }

  if (filters?.month) {
    query = query.eq("month", filters.month)
  }

  if (filters?.scoreRange) {
    query = query.gte("score", filters.scoreRange[0]).lte("score", filters.scoreRange[1])
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching aNPS data:", error)
    return []
  }

  return data as ANPSData[]
}

export async function calculateStateScores() {
  const { data, error } = await supabase.from("anps_data").select("state, score")

  if (error) {
    console.error("Error calculating state scores:", error)
    return {}
  }

  const stateScores: Record<string, number> = {}
  const stateCounts: Record<string, number> = {}

  data.forEach((item) => {
    if (!stateScores[item.state]) {
      stateScores[item.state] = 0
      stateCounts[item.state] = 0
    }
    stateScores[item.state] += item.score
    stateCounts[item.state] += 1
  })

  // Calculate averages and convert to NPS scale
  Object.keys(stateScores).forEach((state) => {
    const avgScore = stateScores[state] / stateCounts[state]
    // Convert 0-10 scale to NPS-like percentage
    stateScores[state] = Math.round((avgScore / 10) * 100)
  })

  return stateScores
}
