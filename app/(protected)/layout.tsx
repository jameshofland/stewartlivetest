import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  return <>{children}</>;
}
