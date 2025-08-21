// app/auth/signout/route.ts
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
  // allow ?next=/somewhere (optional)
  const next = url.searchParams.get("next") || "/login";

  const cookieStore = cookies();

  const cookiesAdapter: SupabaseCookieAdapter = {
    get(name) {
      return cookieStore.get(name)?.value;
    },
    set(name, value, options) {
      cookieStore.set({ name, value, ...options });
    },
    remove(name, options) {
      cookieStore.set({ name, value: "", ...options, expires: new Date(0) });
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookiesAdapter }
  );

  await supabase.auth.signOut();

  // after clearing cookies, send them to login (or ?next)
  return NextResponse.redirect(new URL(next, url.origin));
}
