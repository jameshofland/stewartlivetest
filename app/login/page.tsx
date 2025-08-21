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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="absolute inset-0 pointer-events-none [background-image:radial-gradient(20rem_20rem_at_10%_10%,rgba(99,102,241,0.15),transparent),radial-gradient(18rem_18rem_at_90%_20%,rgba(56,189,248,0.12),transparent),radial-gradient(22rem_22rem_at_20%_90%,rgba(34,197,94,0.10),transparent)]" />
      <Card className="relative w-full max-w-md border-0 shadow-xl backdrop-blur-sm">
        <CardContent className="p-8 space-y-7">
          <div className="flex items-center gap-3">
            <Image
              src="/stewart.png" // make sure this exists in /public
              width={40}
              height={40}
              alt="Stewart"
              className="rounded-xl"
            />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Project Stewart</h1>
              <p className="text-sm text-slate-500">Operational intelligence for eXp</p>
            </div>
          </div>

          <div className="text-slate-600 leading-relaxed">
            <p>Log in with your <span className="font-medium">@exprealty.net</span> account to access dashboards.</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            asChild
            className="w-full h-11 text-base rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* HARD redirect to our server starter (PKCE) */}
            <a href={loginHref}>
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </a>
          </Button>

          <p className="text-xs text-center text-slate-500">
            SSO restricted to <span className="font-medium">exprealty.net</span> • Secure PKCE + HttpOnly cookies
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
