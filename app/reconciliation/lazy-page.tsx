"use client"

import dynamic from "next/dynamic"
import { LoadingFallback } from "@/components/loading-fallback"

const TransactionDashboard = dynamic(() => import("./page"), {
  loading: () => (
    <LoadingFallback
      title="Loading Reconciliation Dashboard"
      description="Preparing transaction data and financial reconciliation tools..."
    />
  ),
  ssr: false,
})

export default function LazyReconciliationPage() {
  return <TransactionDashboard />
}
