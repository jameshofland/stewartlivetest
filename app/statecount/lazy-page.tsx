"use client"

import dynamic from "next/dynamic"
import { LoadingFallback } from "@/components/loading-fallback"

const RealEstateDashboard = dynamic(() => import("./page"), {
  loading: () => (
    <LoadingFallback
      title="Loading State Count Dashboard"
      description="Loading geographic distribution analytics and state-by-state data..."
    />
  ),
  ssr: false,
})

export default function LazyStateCountPage() {
  return <RealEstateDashboard />
}
