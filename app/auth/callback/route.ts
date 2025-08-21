import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/home";
  const code = url.searchParams.get("code");

  // carry will collect Set-Cookie from Supabase
  const carry = NextResponse.next();
  const jar = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => jar.get(n)?.value,
        set: (n, v, o: CookieOptions) => carry.cookies.set({ name: n, value: v, ...o }),
        remove: (n, o: CookieOptions) =>
          carry.cookies.set({ name: n, value: "", ...o, expires: new Date(0) }),
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    const to = new URL(error ? `/login?error=${encodeURIComponent(error.message)}` : next, url.origin);
    carry.headers.set("Location", to.toString());
    return new NextResponse(null, { status: 302, headers: carry.headers });
  }

  carry.headers.set("Location", new URL("/login?error=Authentication%20failed", url.origin).toString());
  return new NextResponse(null, { status: 302, headers: carry.headers });
}
