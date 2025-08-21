import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => cookieStore.set(name, value, options),
        remove: (name: string, options: CookieOptions) =>
          cookieStore.set(name, "", { ...options, expires: new Date(0) }),
      },
    }
  );

  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", "https://project-stewart.com"));
}
