import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/login";

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

  await supabase.auth.signOut();

  carry.headers.set("Location", new URL(next, url.origin).toString());
  return new NextResponse(null, { status: 302, headers: carry.headers });
}
