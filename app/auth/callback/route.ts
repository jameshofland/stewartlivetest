// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type SupabaseCookieAdapter = {
  get(name: string): string | undefined;
  set(name: string, value: string, options: CookieOptions): void;
  remove(name: string, options: CookieOptions): void;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/home";
  const code = url.searchParams.get("code");

  // This response will collect Set-Cookie from Supabase
  const carry = NextResponse.next();
  const reqCookies = cookies();

  const cookiesAdapter: SupabaseCookieAdapter = {
    get(name) {
      return reqCookies.get(name)?.value;
    },
    set(name, value, options) {
      carry.cookies.set({ name, value, ...options });
    },
    remove(name, options) {
      carry.cookies.set({ name, value: "", ...options, expires: new Date(0) });
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookiesAdapter }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const to = new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin);
      return NextResponse.redirect(to, { headers: carry.headers });
    }
    // Redirect to 'next', forwarding the Set-Cookie headers we collected
    const to = new URL(next, url.origin);
    return NextResponse.redirect(to, { headers: carry.headers });
  }

  return NextResponse.redirect(new URL("/login?error=Authentication%20failed", url.origin), {
    headers: carry.headers,
  });
}
