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
  const next = url.searchParams.get("next") || "/login";

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

  await supabase.auth.signOut();

  const to = new URL(next, url.origin);
  return NextResponse.redirect(to, { headers: carry.headers });
}
