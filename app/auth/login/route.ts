import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/home";

  const jar = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string): string | undefined {
          return jar.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions): void {
          jar.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions): void {
          jar.set({ name, value: "", ...options, expires: new Date(0) });
        },
      },
    }
  );

  const redirectTo = `${url.origin}/auth/callback?next=${encodeURIComponent(
    next
  )}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      flowType: "pkce",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
        hd: "exprealty.net",
      },
    } as any,
  });

  if (error || !data?.url) {
    const msg = error?.message ?? "NoAuthURL";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(msg)}`, url.origin)
    );
  }

  return NextResponse.redirect(data.url);
}
