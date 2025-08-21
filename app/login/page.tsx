"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Chrome } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // if already logged in, go home
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) router.replace("/home");
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/home");
    });
    return () => sub.data?.subscription?.unsubscribe();
  }, [router, supabase]);

  // compute ?next= for this page
  const loginHref = useMemo(() => {
    if (typeof window === "undefined") return "/auth/login?next=/home";
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") ?? "/home";
    return `/auth/login?next=${encodeURIComponent(next)}`;
  }, []);

  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center gap-3">
            <Image src="/stewart.png" width={40} height={40} alt="" />
            <h1 className="text-xl font-semibold">Project Stewart</h1>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button asChild className="w-full">
            {/* HARD redirect to our server starter */}
            <a href={loginHref}>
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </a>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
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
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
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
                    {error.includes("domain") || error.includes("unauthorized")
                      ? "Please use your @exprealty.net email address to log in."
                      : error}
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

          {/* Floating accents */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full opacity-60 animate-bounce" />
          <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-blue-400 rounded-full opacity-40 animate-bounce delay-300" />
          <div className="absolute top-1/2 -left-8 w-4 h-4 bg-blue-300 rounded-full opacity-50 animate-bounce delay-700" />
        </div>
      </div>
    </div>
  );
}
