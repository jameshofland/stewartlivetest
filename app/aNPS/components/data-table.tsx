"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface DataTableProps {
  data: Array<{
    state: string
    agentName: string
    score: number
    comment: string
  }>
}

export function DataTable({ data }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter(
    (item) =>
      item.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comment.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getScoreBadge = (score: number) => {
    if (score >= 9) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Promoter</Badge>
    } else if (score >= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Passive</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Detractor</Badge>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-600 font-semibold"
    if (score >= 7) return "text-yellow-600 font-semibold"
    return "text-red-600 font-semibold"
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search by agent name, state, or comment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-600">
        Showing {filteredData.length} of {data.length} responses
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold">State</TableHead>
              <TableHead className="font-semibold">Agent Name</TableHead>
              <TableHead className="font-semibold">Score</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Comment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No results found for "{searchTerm}"
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow key={index} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{item.state}</TableCell>
                  <TableCell>{item.agentName}</TableCell>
                  <TableCell className={getScoreColor(item.score)}>{item.score}/10</TableCell>
                  <TableCell>{getScoreBadge(item.score)}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={item.comment}>
                      {item.comment}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
