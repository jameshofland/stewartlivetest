import { supabase } from "./supabase"

const fetchAllHistory = async () => {
  const pageSize = 1000
  const allRows: any[] = []
  let from = 0
  let to = pageSize - 1

  while (true) {
    const { data, error } = await supabase
      .from("zstate_file_history")
      .select("state, region, month, total_count", { count: "exact" })
      .range(from, to)

    if (error) {
      console.error("Error fetching paginated history:", error)
      break
    }

    if (!data || data.length === 0) break

    allRows.push(...data)

    if (data.length < pageSize) break

    from += pageSize
    to += pageSize
  }

  return allRows
}

export class DatabaseService {
  // Fetch historical total data
  static async getHistoricalData(): Promise<Record<string, Record<string, any>>> {
    try {
      const data = await fetchAllHistory()

      const historicalData: Record<string, Record<string, any>> = {}

      data?.forEach((row) => {
        const month = row.month?.trim()
        const stateCode = row.state

        if (!historicalData[month]) {
          historicalData[month] = {}
        }

        historicalData[month][stateCode] = {
          open: 0,
          closed: 0,
          withdrawn: 0,
          total: row.total_count || 0,
          region: row.region,
        }
      })

      return historicalData
    } catch (error) {
      console.error("Database error:", error)
      return {}
    }
  }

  // Fetch current month data from zstate_file_current_month table
  static async getCurrentMonthData(): Promise<Record<string, any>> {
    try {
      const { data, error } = await supabase
        .from("zstate_file_current_month")
        .select("state, region, open_count, closed_count, withdrawn_count")

      if (error) {
        console.error("Error fetching current month data:", error)
        return {}
      }

      const currentData: Record<string, any> = {}

      data?.forEach((row) => {
        const stateCode = row.state

        currentData[stateCode] = {
          open: row.open_count || 0,
          closed: row.closed_count || 0,
          withdrawn: row.withdrawn_count || 0,
          total: (row.open_count || 0) + (row.closed_count || 0) + (row.withdrawn_count || 0),
          region: row.region,
        }
      })

      return currentData
    } catch (error) {
      console.error("Database error:", error)
      return {}
    }
  }

  static calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return Number.parseFloat((((current - previous) / previous) * 100).toFixed(2))
  }

  static getPreviousMonth(month: string): string {
    const date = new Date(month + "-01")
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().slice(0, 7)
  }

  static getPreviousYearMonth(month: string): string {
    const date = new Date(month + "-01")
    date.setFullYear(date.getFullYear() - 1)
    return date.toISOString().slice(0, 7)
  }

  static async getStateDataByMonth(month: string): Promise<Record<string, any>> {
    try {
      let currentMonthData: Record<string, any> = {}

      if (month === "current") {
        currentMonthData = await this.getCurrentMonthData()
      } else {
        const historicalData = await this.getHistoricalData()
        currentMonthData = historicalData[month] || {}
      }

      const historicalData = await this.getHistoricalData()

      let previousMonthData: Record<string, any> = {}
      let previousYearData: Record<string, any> = {}

      if (month !== "current") {
        const previousMonth = this.getPreviousMonth(month)
        const previousYearMonth = this.getPreviousYearMonth(month)
        previousMonthData = historicalData[previousMonth] || {}
        previousYearData = historicalData[previousYearMonth] || {}
      } else {
        // Use real calendar math to compute previous month (e.g., handle Jan -> Dec)
        const currentDate = new Date()

        const previousMonthDate = new Date(currentDate)
        previousMonthDate.setMonth(previousMonthDate.getMonth() - 1)
        const previousMonthKey = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, "0")}`

        // Use same month last year for YoY
        const previousYearMonth = `${currentDate.getFullYear() - 1}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

        previousMonthData = historicalData[previousMonthKey] || {}
        previousYearData = historicalData[previousYearMonth] || {}
      }

      const transformedData: Record<string, any> = {}

      Object.keys(currentMonthData).forEach((stateCode) => {
        const current = currentMonthData[stateCode]
        const previous = previousMonthData[stateCode]
        const previousYear = previousYearData[stateCode]

        transformedData[stateCode] = {
          open: current.open,
          closed: current.closed,
          withdrawn: current.withdrawn,
          total: current.total,
          region: current.region,
          openChange: previous ? this.calculatePercentageChange(current.open, previous.open) : 0,
          closedChange: previous ? this.calculatePercentageChange(current.closed, previous.closed) : 0,
          withdrawnChange: previous ? this.calculatePercentageChange(current.withdrawn, previous.withdrawn) : 0,
          totalChange: previous ? this.calculatePercentageChange(current.total, previous.total) : 0,
          previousMonthChange: previous ? this.calculatePercentageChange(current.total, previous.total) : null,
          yearOverYearChange: previousYear ? this.calculatePercentageChange(current.total, previousYear.total) : null,
        }
      })

      return transformedData
    } catch (error) {
      console.error("Database error:", error)
      return {}
    }
  }

  static async getStateDataByMonthAndRegion(month: string, region?: string): Promise<Record<string, any>> {
    const allData = await this.getStateDataByMonth(month)

    if (!region || region === "all") {
      return allData
    }

    const filteredData: Record<string, any> = {}
    Object.keys(allData).forEach((stateCode) => {
      if (allData[stateCode].region === region) {
        filteredData[stateCode] = allData[stateCode]
      }
    })

    return filteredData
  }

  static async getAvailableMonths(): Promise<Array<{ value: string; label: string }>> {
    try {
      const months = [{ value: "current", label: "Current Month" }]

      const { data, error } = await supabase
        .from("zstate_file_history")
        .select("month")
        .order("month", { ascending: false })

      if (error) {
        console.error("Error fetching months:", error)
        return months
      }

      const uniqueMonths = [...new Set(data?.map((row) => row.month) || [])]

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]

      uniqueMonths.forEach((month) => {
        const [year, monthNum] = month.split("-")
        const monthIndex = Number.parseInt(monthNum, 10) - 1
        const label = `${monthNames[monthIndex]} ${year}`

        months.push({
          value: month,
          label,
        })
      })

      return months
    } catch (error) {
      console.error("Database error:", error)
      return [{ value: "current", label: "Current Month" }]
    }
  }

  static async getRegions(): Promise<string[]> {
    try {
      const [current, history] = await Promise.all([
        supabase.from("zstate_file_current_month").select("region"),
        supabase.from("zstate_file_history").select("region"),
      ])

      const regions = new Set<string>()
      current.data?.forEach((row) => {
        if (row.region) regions.add(row.region)
      })
      history.data?.forEach((row) => {
        if (row.region) regions.add(row.region)
      })

      return Array.from(regions).sort()
    } catch (error) {
      console.error("Database error:", error)
      return []
    }
  }
}
