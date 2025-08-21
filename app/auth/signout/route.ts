import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/login";

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

  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(next, url.origin));
}
