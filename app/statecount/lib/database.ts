'use client';
import { getSupabaseBrowserClient } from './supabase';

// ───────────────────────────────────────────────────────────────────────────────
// Row types
export interface StateHistoryRow {
  state: string;
  region: string | null;
  month: string;         // "YYYY-MM"
  total_count: number;
}

export interface StateCurrentRow {
  state: string;
  region: string | null;
  open_count: number;
  closed_count: number;
  withdrawn_count: number;
}

export type Option = { value: string; label: string };

// Month label helper (e.g., "2025-07" -> "Jul 2025")
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const labelMonth = (yyyyMm: string): string => {
  const [y, m] = yyyyMm.split('-');
  const mi = Math.max(1, Math.min(12, Number(m))) - 1;
  return `${MONTHS[mi]} ${y}`;
};

// Fetch all history with pagination (typed)
export const fetchAllHistory = async (): Promise<StateHistoryRow[]> => {
  const supabase = getSupabaseBrowserClient();
  const pageSize = 1000;
  const allRows: StateHistoryRow[] = [];
  let from = 0;
  let to = pageSize - 1;

  while (true) {
    const { data, error } = await supabase
      .from('zstate_file_history')
      .select('state, region, month, total_count')
      .returns<StateHistoryRow[]>()     // <- type for the returned rows
      .range(from, to);

    if (error) {
      console.error('Error fetching paginated history:', error);
      break;
    }

    const pageRows: StateHistoryRow[] = data ?? [];  // <- single declaration
    allRows.push(...pageRows);

    if (pageRows.length < pageSize) break; // no more pages
    from += pageSize;
    to += pageSize;
  }

  return allRows;
};


// ───────────────────────────────────────────────────────────────────────────────
// Public API used by the State Count UI
export class DatabaseService {
  // Build: historicalData[month][state] = { region, total_count }
  static async getHistoricalData(): Promise<
    Record<string, Record<string, { region: string | null; total_count: number }>>
  > {
    try {
      const rows = await fetchAllHistory();
      const historicalData: Record<
        string,
        Record<string, { region: string | null; total_count: number }>
      > = {};

      for (const row of rows) {
        if (!historicalData[row.month]) historicalData[row.month] = {};
        historicalData[row.month][row.state] = {
          region: row.region ?? null,
          total_count: row.total_count ?? 0,
        };
      }

      return historicalData;
    } catch (error) {
      console.error('Database error:', error);
      return {};
    }
  }

  // Current month snapshot from zstate_file_current_month
  static async getCurrentMonthData(): Promise<
    Record<
      string,
      {
        region: string | null;
        open_count: number;
        closed_count: number;
        withdrawn_count: number;
        total_count: number;
      }
    >
  > {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
  .from('zstate_file_current_month')
  .select('state, region, open_count, closed_count, withdrawn_count')
  .returns<StateCurrentRow[]>();  // <- each row has these fields

const rows: StateCurrentRow[] = data ?? [];


      if (error) {
        console.error('Error fetching current month data:', error);
        return {};
      }

      const map: Record<
        string,
        {
          region: string | null;
          open_count: number;
          closed_count: number;
          withdrawn_count: number;
          total_count: number;
        }
      > = {};

      for (const row of data ?? []) {
        const open = row.open_count ?? 0;
        const closed = row.closed_count ?? 0;
        const withdrawn = row.withdrawn_count ?? 0;
        map[row.state] = {
          region: row.region ?? null,
          open_count: open,
          closed_count: closed,
          withdrawn_count: withdrawn,
          total_count: open + closed + withdrawn,
        };
      }

      return map;
    } catch (error) {
      console.error('Database error:', error);
      return {};
    }
  }

  // Month helpers
  static getPreviousMonth(month: string): string {
    const date = new Date(month + '-01');
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 7);
  }

  static getPreviousYearMonth(month: string): string {
    const date = new Date(month + '-01');
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().slice(0, 7);
  }

  // Combined state data for a given month ("current" or "YYYY-MM") + MoM/YoY deltas
  static async getStateDataByMonth(month: string): Promise<Record<string, any>> {
    try {
      let currentMonthData: Record<string, any> = {};

      if (month === 'current') {
        currentMonthData = await this.getCurrentMonthData();
      }

      // get historical for deltas
      const historicalData = await this.getHistoricalData();

      let previousMonthData: Record<string, any> = {};
      let previousYearData: Record<string, any> = {};

      if (month !== 'current') {
        const previousMonth = this.getPreviousMonth(month);
        const previousYearMonth = this.getPreviousYearMonth(month);
        previousMonthData = historicalData[previousMonth] || {};
        previousYearData = historicalData[previousYearMonth] || {};
      } else {
        // compare to real previous calendar month and same month last year
        const now = new Date();
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevYearDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        const prevMonth = prevMonthDate.toISOString().slice(0, 7);
        const prevYearMonth = prevYearDate.toISOString().slice(0, 7);
        previousMonthData = historicalData[prevMonth] || {};
        previousYearData = historicalData[prevYearMonth] || {};
      }

      const result: Record<string, any> = {};

      if (month === 'current') {
        // use live counts
        for (const [state, val] of Object.entries(currentMonthData)) {
          const pm = previousMonthData[state]?.total_count ?? 0;
          const py = previousYearData[state]?.total_count ?? 0;
          result[state] = {
            state,
            region: val.region ?? null,
            open_count: val.open_count,
            closed_count: val.closed_count,
            withdrawn_count: val.withdrawn_count,
            total_count: val.total_count,
            delta_mom: val.total_count - pm,
            delta_yoy: val.total_count - py,
          };
        }
      } else {
        // use historical snapshot for requested month
        const snapshot: Record<string, { region: string | null; total_count: number }> =
          historicalData[month] || {};
        for (const state of Object.keys(snapshot)) {
          const val = snapshot[state];
          const pm = previousMonthData[state]?.total_count ?? 0;
          const py = previousYearData[state]?.total_count ?? 0;
          result[state] = {
            state,
            region: val.region ?? null,
            total_count: val.total_count ?? 0,
            delta_mom: (val.total_count ?? 0) - pm,
            delta_yoy: (val.total_count ?? 0) - py,
          };
        }
      }

      return result;
    } catch (error) {
      console.error('Database error:', error);
      return {};
    }
  }

  static async getStateDataByMonthAndRegion(
    month: string,
    region?: string,
  ): Promise<Record<string, any>> {
    const allData = await this.getStateDataByMonth(month);

    if (!region || region === 'all') {
      return allData;
    }

    const filtered: Record<string, any> = {};
    for (const stateCode of Object.keys(allData)) {
      if (allData[stateCode].region === region) {
        filtered[stateCode] = allData[stateCode];
      }
    }

    return filtered;
  }

  // Distinct months (history) + "current" first
  static async getAvailableMonths(): Promise<Option[]> {
    try {
      const supabase = getSupabaseBrowserClient(); // ← make the client
  
      const { data, error } = await supabase
        .from('zstate_file_history')
        .select('month')
        .returns<{ month: string }[]>();           // ← type the returned rows
  
      if (error) {
        console.error('Error fetching months:', error);
        return [{ value: 'current', label: 'Current' }];
      }
  
      // unique months as strings
      const monthsArr: string[] = (data ?? []).map((r: { month: string }) => r.month);
      const unique: string[] = Array.from(new Set<string>(monthsArr)).sort();
  
      const opts: Option[] = [
        { value: 'current', label: 'Current' },
        ...unique.map((m: string) => ({ value: m, label: labelMonth(m) })),
      ];
  
      return opts;
    } catch (err) {
      console.error('Database error:', err);
      return [{ value: 'current', label: 'Current' }];
    }
  }
}
  