"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Chrome } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // If a session exists (or appears), go to /home
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/home");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/home");
    });

    return () => {
      try {
        sub.subscription.unsubscribe();
      } catch {}
    };
  }, [router, supabase]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://project-stewart.com";

      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      const next = params.get("next") ?? "/home";
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,               // our server callback (sets HttpOnly cookies)
          flowType: "pkce",         // <-- force PKCE so /auth/callback gets ?code=...
          queryParams: {
            access_type: "offline",
            prompt: "consent",
            hd: "exprealty.net",
          },
        } as any, // hush older typings
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message ?? "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

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
