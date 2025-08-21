import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseServerClient(): SupabaseClient {
  const jar = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return jar.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          jar.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          jar.set({ name, value: "", ...options, expires: new Date(0) });
        },
      },
    }
  );
}