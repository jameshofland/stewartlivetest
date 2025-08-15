"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Chrome } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/home')
      }
    }
    checkUser()
  }, [router, supabase.auth])
console.log("🟢 Button clicked");
  const handleGoogleLogin = async () => {
  try {
    setIsLoading(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',     // 🔁 Ensures refresh token is included
          prompt: 'consent',          // 🔁 Forces consent screen (for refresh)
          hd: 'exprealty.net',        // 🔐 Restricts email domain (Google-side)
        },
      },
    })

    if (authError) {
      throw authError
    }
  } catch (err: any) {
    console.error('Login error:', err)
    setError(err.message || 'An error occurred during login')
  } finally {
    setIsLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-3">
                Welcome to Project Stewart
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed">
                Log in with your @exprealty.net account to access dashboards.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Chrome className="h-5 w-5" />
                    <span>Continue with Google</span>
                  </>
                )}
              </Button>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error.includes('domain') || error.includes('unauthorized') 
                      ? 'Please use your @exprealty.net email address to log in.'
                      : error
                    }
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Only @exprealty.net accounts are authorized
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Stewart Robot Illustration */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-bl from-blue-100 to-slate-100">
        <div className="relative">
          <div className="w-96 h-96 bg-white rounded-full shadow-2xl flex items-center justify-center">
            <Image
              src="/images/stewart.png"
              alt="Stewart Robot"
              width={300}
              height={300}
              className="object-contain animate-pulse"
              priority
            />
          </div>
          
          {/* Floating elements for tech-forward feel */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full opacity-60 animate-bounce"></div>
          <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-blue-400 rounded-full opacity-40 animate-bounce delay-300"></div>
          <div className="absolute top-1/2 -left-8 w-4 h-4 bg-blue-300 rounded-full opacity-50 animate-bounce delay-700"></div>
        </div>
      </div>
    </div>
  )
}
