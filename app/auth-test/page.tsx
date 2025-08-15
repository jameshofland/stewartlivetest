'use client'

import { useEffect } from 'react'
import { getSupabaseBrowserClient } from "@/lib/supabase"

export default function AuthTestPage() {
  const supabase = getSupabaseBrowserClient()
  
  useEffect(() => {
    console.log('✅ Supabase client initialized')

    const fetchDebugAuthContext = async () => {
      const { data, error } = await supabase
        .from('debug_auth_context')
        .select('*')

      if (error) {
        console.error('🔴 Failed to fetch debug_auth_context:', error)
      } else {
        console.log('✅ debug_auth_context:', data)
      }
    }

    fetchDebugAuthContext()
  }, [supabase])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">🔍 Auth Debug Page</h1>
      <p>Open your dev console to see your Supabase session info.</p>
    </div>
  )
}
