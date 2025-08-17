"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, Eye, AlertTriangle, ChevronLeft, ChevronRight, Loader2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { HomeButton } from "@/components/navigation"; // named import

const supabase = getSupabaseBrowserClient();

interface Transaction {
  id: string
  ta_name: string
  trx_id: string
  property_address: string
  agent_name: string
  office_name: string
  ta_notes: string
  lead_notes: string
  lead_name: string
  last_updated: string
  gci: number | null            // ← NEW
}

interface UnmatchedTransaction {
  id: string
  trx_id: string
  property_address: string
  agent_name: string
  office_name: string
  region_name: string
  coe_date: string
  assigned_ta: string
  flagged_reason: string
  created_at: string
}

interface User {
  name: string
}

interface PaginationState {
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  cursors: string[]
  totalCount: number
}

export default function TransactionDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [colorblindMode, setColorblindMode] = useState(false)
  const [activeTab, setActiveTab] = useState("matched")
  const [tabLoading, setTabLoading] = useState(false)

  // Matched Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsPagination, setTransactionsPagination] = useState<PaginationState>({
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
    cursors: [""],
    totalCount: 0,
  })
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [transactionsSearchTerm, setTransactionsSearchTerm] = useState("")
  const [transactionsTaNameFilter, setTransactionsTaNameFilter] = useState("all")
  const [transactionsLeadNameFilter, setTransactionsLeadNameFilter] = useState("all")

  // Filter options state
  const [taNameOptions, setTaNameOptions] = useState<string[]>([])
  const [leadNameOptions, setLeadNameOptions] = useState<string[]>([])

  // Unmatched Transactions State
  const [unmatchedTransactions, setUnmatchedTransactions] = useState<UnmatchedTransaction[]>([])
  const [unmatchedPagination, setUnmatchedPagination] = useState<PaginationState>({
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
    cursors: [""],
    totalCount: 0,
  })
  const [unmatchedLoading, setUnmatchedLoading] = useState(false)
  const [unmatchedSearchTerm, setUnmatchedSearchTerm] = useState("")

  const [summary, setSummary] = useState<{
    transactions_remaining: number
    amount_remaining: number
  } | null>(null)

  const rowsPerPage = 50

  // Summary metrics
  const totalOpenFiles = transactions.filter((t) => t.ta_notes !== "Resolved").length
  const noTANotesOld = transactions.filter(
    (t) => t.ta_notes === "Open" && new Date(t.last_updated) < new Date(Date.now() - 24 * 60 * 60 * 1000),
  ).length
  const recentlyResolved = transactions.filter(
    (t) => t.ta_notes === "Resolved" && new Date(t.last_updated) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  ).length

  useEffect(() => {
    fetchUser()
    fetchTransactions(1)
    fetchFilterOptions()
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('v_reconciliation_summary')
        .select('*')
        .single()
      if (!error && data) setSummary(data)
    } catch (e) {
      console.error('Error fetching summary:', e)
    }
  }  

  useEffect(() => {
    if (activeTab === "unmatched" && unmatchedTransactions.length === 0) {
      fetchUnmatchedTransactions(1)
    }
  }, [activeTab])

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setUser({ name: user.user_metadata?.name || user.email || "User" })
    } else {
      setUser({ name: "Demo User" })
    }
  }

  const fetchFilterOptions = async () => {
    try {
      // Fetch unique TA names
      const { data: taNames } = await supabase.from("transactions").select("ta_name").not("ta_name", "is", null)

      // Fetch unique Lead names
      const { data: leadNames } = await supabase.from("transactions").select("lead_name").not("lead_name", "is", null)

      if (taNames) {
        const uniqueTaNames = [...new Set(taNames.map((item) => item.ta_name))].sort()
        setTaNameOptions(uniqueTaNames)
      }

      if (leadNames) {
        const uniqueLeadNames = [...new Set(leadNames.map((item) => item.lead_name))].sort()
        setLeadNameOptions(uniqueLeadNames)
      }
    } catch (error) {
      console.error("Error fetching filter options:", error)
    }
  }

  const buildTransactionsQuery = () => {
    let query = supabase.from("transactions").select("*", { count: "exact" })

    // Apply filters
    if (transactionsSearchTerm) {
      query = query.or(
        `trx_id.ilike.%${transactionsSearchTerm}%,agent_name.ilike.%${transactionsSearchTerm}%,property_address.ilike.%${transactionsSearchTerm}%`,
      )
    }
    if (transactionsTaNameFilter && transactionsTaNameFilter !== "all") {
      query = query.eq("ta_name", transactionsTaNameFilter)
    }
    if (transactionsLeadNameFilter && transactionsLeadNameFilter !== "all") {
      query = query.eq("lead_name", transactionsLeadNameFilter)
    }

    return query
  }

  const fetchTransactions = async (page: number, cursor?: string) => {
    setTransactionsLoading(true)
    try {
      let query = buildTransactionsQuery()

      // Apply cursor pagination
      if (cursor && cursor !== "") {
        query = query.gt("trx_id", cursor)
      }

      query = query.order("trx_id", { ascending: true }).limit(rowsPerPage + 1)

      const { data, error, count } = await query

      if (error) {
        console.error("Error fetching transactions:", error)
        return
      }

      const hasMore = data && data.length > rowsPerPage
      const transactions = hasMore ? data.slice(0, rowsPerPage) : data || []

      setTransactions(transactions)

      // Update pagination state
      const newCursors = [...transactionsPagination.cursors]
      if (page > newCursors.length - 1) {
        newCursors.push(cursor || "")
      }

      setTransactionsPagination({
        currentPage: page,
        hasNextPage: hasMore,
        hasPrevPage: page > 1,
        cursors: newCursors,
        totalCount: count || 0,
      })
    } catch (error) {
      console.error("Error fetching transactions:", error)
    }
    setTransactionsLoading(false)
  }

  const fetchUnmatchedTransactions = async (page: number, cursor?: string) => {
    setUnmatchedLoading(true)
    try {
      let query = supabase.from("unmatched_trx_data").select("*", { count: "exact" })

      // Apply search filter
      if (unmatchedSearchTerm) {
        query = query.or(
          `trx_id.ilike.%${unmatchedSearchTerm}%,agent_name.ilike.%${unmatchedSearchTerm}%,property_address.ilike.%${unmatchedSearchTerm}%`,
        )
      }

      // Apply cursor pagination
      if (cursor && cursor !== "") {
        query = query.gt("trx_id", cursor)
      }

      query = query.order("trx_id", { ascending: true }).limit(rowsPerPage + 1)

      const { data, error, count } = await query

      if (error) {
        console.error("Error fetching unmatched transactions:", error)
        return
      }

      const hasMore = data && data.length > rowsPerPage
      const unmatchedTransactions = hasMore ? data.slice(0, rowsPerPage) : data || []

      setUnmatchedTransactions(unmatchedTransactions)

      // Update pagination state
      const newCursors = [...unmatchedPagination.cursors]
      if (page > newCursors.length - 1) {
        newCursors.push(cursor || "")
      }

      setUnmatchedPagination({
        currentPage: page,
        hasNextPage: hasMore,
        hasPrevPage: page > 1,
        cursors: newCursors,
        totalCount: count || 0,
      })
    } catch (error) {
      console.error("Error fetching unmatched transactions:", error)
    }
    setUnmatchedLoading(false)
  }

  const handleTransactionsPageChange = (direction: "next" | "prev") => {
    const { currentPage, cursors } = transactionsPagination

    if (direction === "next" && transactionsPagination.hasNextPage) {
      const lastTransaction = transactions[transactions.length - 1]
      const cursor = lastTransaction?.trx_id
      fetchTransactions(currentPage + 1, cursor)
    } else if (direction === "prev" && transactionsPagination.hasPrevPage) {
      const cursor = cursors[currentPage - 2] || ""
      fetchTransactions(currentPage - 1, cursor)
    }
  }

  const handleUnmatchedPageChange = (direction: "next" | "prev") => {
    const { currentPage, cursors } = unmatchedPagination

    if (direction === "next" && unmatchedPagination.hasNextPage) {
      const lastTransaction = unmatchedTransactions[unmatchedTransactions.length - 1]
      const cursor = lastTransaction?.trx_id
      fetchUnmatchedTransactions(currentPage + 1, cursor)
    } else if (direction === "prev" && unmatchedPagination.hasPrevPage) {
      const cursor = cursors[currentPage - 2] || ""
      fetchUnmatchedTransactions(currentPage - 1, cursor)
    }
  }

  const handleTabChange = async (value: string) => {
    if (value === activeTab) return

    setTabLoading(true)
    setActiveTab(value)

    // Simulate loading delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    setTabLoading(false)
  }

  const handleTransactionsSearch = () => {
    // Reset pagination and fetch from beginning
    setTransactionsPagination({
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      cursors: [""],
      totalCount: 0,
    })
    fetchTransactions(1)
  }

  const handleUnmatchedSearch = () => {
    // Reset pagination and fetch from beginning
    setUnmatchedPagination({
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      cursors: [""],
      totalCount: 0,
    })
    fetchUnmatchedTransactions(1)
  }

  // Debounced search effect for transactions
  useEffect(() => {
    const timer = setTimeout(() => {
      handleTransactionsSearch()
    }, 500)
    return () => clearTimeout(timer)
  }, [transactionsSearchTerm, transactionsTaNameFilter, transactionsLeadNameFilter])

  // Debounced search effect for unmatched
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "unmatched") {
        handleUnmatchedSearch()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [unmatchedSearchTerm, activeTab])

  const updateTransaction = async (id: string, field: string, value: string) => {
  try {
    const { error } = await supabase
      .from("transactions")
      .update({
        [field]: value,
        last_updated: new Date().toISOString(),
      })
      .eq("id", id)

    if (!error) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, [field]: value, last_updated: new Date().toISOString() } : t
        ),
      )
      // 👇 Add this line to refresh the top counters after an update
      fetchSummary()
    } else {
      console.error("Error updating transaction:", error)
    }
  } catch (error) {
    console.error("Error updating transaction:", error)
  }
}

  const updateUnmatchedTransaction = async (id: string, assignedTa: string) => {
    try {
      const { error } = await supabase.from("unmatched_trx_data").update({ assigned_ta: assignedTa }).eq("id", id)

      if (!error) {
        setUnmatchedTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, assigned_ta: assignedTa } : t)))
      } else {
        console.error("Error updating unmatched transaction:", error)
      }
    } catch (error) {
      console.error("Error updating unmatched transaction:", error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    const fmtMoney = (n?: number | string | null) =>
      n === null || n === undefined || n === ''
        ? '—'
        : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
            .format(typeof n === 'number' ? n : Number(n))

    if (isToday) {
      return `Today at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`
    }

    return `Updated: ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`
  }

  const isOldOpen = (transaction: Transaction) => {
    return (
      transaction.ta_notes === "Open" && new Date(transaction.last_updated) < new Date(Date.now() - 24 * 60 * 60 * 1000)
    )
  }

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-200",
        darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50",
      )}
    >
      <HomeButton />
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Reconciliation Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setColorblindMode(!colorblindMode)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Colorblind Mode
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {darkMode ? "Light" : "Dark"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Summary Cards - Only show for matched transactions */}
        {activeTab === "matched" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Open Files</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="text-2xl font-bold">
                 {summary?.transactions_remaining ?? totalOpenFiles}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  No TA Notes (1+ Day)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{noTANotesOld}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Resolved (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{recentlyResolved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  $ Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fmtMoney(summary?.amount_remaining ?? 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Tabs */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="matched" className="flex items-center gap-2">
                  {tabLoading && activeTab === "matched" && <Loader2 className="h-4 w-4 animate-spin" />}
                  Matched Transactions
                </TabsTrigger>
                <TabsTrigger value="unmatched" className="flex items-center gap-2">
                  {tabLoading && activeTab === "unmatched" && <Loader2 className="h-4 w-4 animate-spin" />}
                  Unmatched Files
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matched" className="mt-6">
                {/* Search and Filters for Matched */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Search by TRX ID, Agent Name, or Property Address..."
                      value={transactionsSearchTerm}
                      onChange={(e) => setTransactionsSearchTerm(e.target.value)}
                      className="md:col-span-1"
                    />
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Select
                        value={transactionsTaNameFilter}
                        onValueChange={(value) => setTransactionsTaNameFilter(value || "all")}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Filter by TA Name..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All TA Names</SelectItem>
                          {taNameOptions.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Select
                        value={transactionsLeadNameFilter}
                        onValueChange={(value) => setTransactionsLeadNameFilter(value || "all")}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Filter by Lead Name..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Lead Names</SelectItem>
                          {leadNameOptions.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Matched Transactions Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactionsLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        Loading transactions...
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No transactions found matching your search criteria.
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>TA Name</TableHead>
                                <TableHead>TRX ID</TableHead>
                                <TableHead>GCI</TableHead>  
                                <TableHead>Property Address</TableHead>
                                <TableHead>Agent Name</TableHead>
                                <TableHead>Office Name</TableHead>
                                <TableHead>TA Notes</TableHead>
                                <TableHead>Lead Notes</TableHead>
                                <TableHead>Lead Name</TableHead>
                                <TableHead>Last Updated</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {transactions.map((transaction) => (
                                <TableRow key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <TableCell className="font-medium">{transaction.ta_name}</TableCell>
                                  <TableCell>{transaction.trx_id}</TableCell>
                                  <TableCell className="text-right tabular-nums">
                                    {fmtMoney(transaction.gci)}
                                    </TableCell>
                                  <TableCell>{transaction.property_address}</TableCell>
                                  <TableCell>{transaction.agent_name}</TableCell>
                                  <TableCell>{transaction.office_name}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {isOldOpen(transaction) && (
                                        <AlertTriangle
                                          className={cn("h-4 w-4", colorblindMode ? "text-orange-500" : "text-red-500")}
                                        />
                                      )}
                                      <Select
                                        value={transaction.ta_notes}
                                        onValueChange={(value) => updateTransaction(transaction.id, "ta_notes", value)}
                                      >
                                        <SelectTrigger className="w-32">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Open">Open</SelectItem>
                                          <SelectItem value="Emailed">Emailed</SelectItem>
                                          <SelectItem value="Called">Called</SelectItem>
                                          <SelectItem value="Resolved">Resolved</SelectItem>
                                          <SelectItem value="Escalated">Escalated</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={transaction.lead_notes}
                                      onValueChange={(value) => updateTransaction(transaction.id, "lead_notes", value)}
                                    >
                                      <SelectTrigger className="w-36">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Unreviewed">Unreviewed</SelectItem>
                                        <SelectItem value="Call Agent">Call Agent</SelectItem>
                                        <SelectItem value="Call Title">Call Title</SelectItem>
                                        <SelectItem value="See Lead">See Lead</SelectItem>
                                        <SelectItem value="Ready for Review">Ready for Review</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>{transaction.lead_name}</TableCell>
                                  <TableCell>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatTimestamp(transaction.last_updated)}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination for Matched */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-gray-500">
                            Page {transactionsPagination.currentPage} • {transactionsPagination.totalCount} total
                            records
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTransactionsPageChange("prev")}
                              disabled={!transactionsPagination.hasPrevPage}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTransactionsPageChange("next")}
                              disabled={!transactionsPagination.hasNextPage}
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="unmatched" className="mt-6">
                {/* Search for Unmatched */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      placeholder="Search by TRX ID, Agent Name, or Property Address..."
                      value={unmatchedSearchTerm}
                      onChange={(e) => setUnmatchedSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Unmatched Transactions Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Unmatched Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {unmatchedLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        Loading unmatched files...
                      </div>
                    ) : unmatchedTransactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No unmatched transactions found.</div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>TRX ID</TableHead>
                                <TableHead>Property Address</TableHead>
                                <TableHead>Agent Name</TableHead>
                                <TableHead>Office Name</TableHead>
                                <TableHead>Region Name</TableHead>
                                <TableHead>COE Date</TableHead>
                                <TableHead>Assigned TA</TableHead>
                                <TableHead>Flagged Reason</TableHead>
                                <TableHead>Created At</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {unmatchedTransactions.map((transaction) => (
                                <TableRow key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <TableCell className="font-medium">{transaction.trx_id}</TableCell>
                                  <TableCell>{transaction.property_address}</TableCell>
                                  <TableCell>{transaction.agent_name}</TableCell>
                                  <TableCell>{transaction.office_name}</TableCell>
                                  <TableCell>{transaction.region_name}</TableCell>
                                  <TableCell>{transaction.coe_date}</TableCell>
                                  <TableCell>
                                    <Input
                                      value={transaction.assigned_ta || ""}
                                      onChange={(e) => updateUnmatchedTransaction(transaction.id, e.target.value)}
                                      placeholder="Assign TA..."
                                      className="w-32"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{transaction.flagged_reason}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-xs text-gray-500">
                                      {new Date(transaction.created_at).toLocaleDateString()}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Pagination for Unmatched */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-gray-500">
                            Page {unmatchedPagination.currentPage} • {unmatchedPagination.totalCount} total records
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnmatchedPageChange("prev")}
                              disabled={!unmatchedPagination.hasPrevPage}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnmatchedPageChange("next")}
                              disabled={!unmatchedPagination.hasNextPage}
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
