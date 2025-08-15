"use client";

import dynamic from "next/dynamic";
import { LoadingFallback } from "@/components/loading-fallback";

const ANPSDashboard = dynamic(() => import("./page"), {
  loading: () => (
    <LoadingFallback
      title="Loading aNPS Dashboard"
      description="Preparing agent feedback analytics and NPS scoring data..."
    />
  ),
  ssr: false,
});

export default function LazyANPSPage() {
  return <ANPSDashboard />;
}
