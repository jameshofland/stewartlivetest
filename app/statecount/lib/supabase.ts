import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Updated types to match actual table structure

export interface ZStateFileHistory {
  state: string
  region: string
  month: string
  total_count: number
  source?: string
  updated_at?: string
}

export interface ZStateFileCurrentMonth {
  state: string
  region: string
  month: string
  open_count: number
  closed_count: number
  withdrawn_count: number
  updated_at?: string
}

export interface StateData {
  open: number
  closed: number
  withdrawn: number
  total: number
  region: string
  openChange: number
  closedChange: number
  withdrawnChange: number
  totalChange: number
  previousMonthChange: number | null
  yearOverYearChange: number | null
}

export interface StateTrend {
  month: string
  open: number
  closed: number
  withdrawn: number
  total: number
}

export interface TopStatePerformance {
  state: string
  region: string
  total: number
  change: number
}
