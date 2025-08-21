import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/home";
  const code = url.searchParams.get("code");

  const jar = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n: string) => jar.get(n)?.value,
        set: (n: string, v: string, o: CookieOptions) =>
          jar.set({ name: n, value: v, ...o }),
        remove: (n: string, o: CookieOptions) =>
          jar.set({ name: n, value: "", ...o, expires: new Date(0) }),
      } as any,
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    const dest = new URL(
      error ? `/login?error=${encodeURIComponent(error.message)}` : next,
      url.origin
    );
    return NextResponse.redirect(dest);
  }

  // ---- DEBUG: show EXACT query-string we received ----
  // Examples you may see:
  //   ?error=access_denied&error_description=...        (Google rejected)
  //   ?state=...                                        (implicit flow or intermediate redirect)
  const qs = url.search; // includes leading '?'
  return NextResponse.redirect(
    new URL(`/login?error=NoCode&qs=${encodeURIComponent(qs)}`, url.origin)
  );
}
