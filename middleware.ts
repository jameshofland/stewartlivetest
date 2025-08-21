// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type SupabaseCookieAdapter = {
  get(name: string): string | undefined;
  set(name: string, value: string, options: CookieOptions): void;
  remove(name: string, options: CookieOptions): void;
};

export async function middleware(req: NextRequest) {
  // Create a response that Supabase can attach Set-Cookie to
  const res = NextResponse.next();

  const cookiesAdapter: SupabaseCookieAdapter = {
    get(name) {
      return req.cookies.get(name)?.value;
    },
    set(name, value, options) {
      res.cookies.set({ name, value, ...options });
    },
    remove(name, options) {
      res.cookies.set({ name, value: "", ...options, expires: new Date(0) });
    },
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookiesAdapter }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  const isAuthRoute = path.startsWith("/login") || path.startsWith("/auth");
  const isStatic =
    path === "/robots.txt" ||
    path === "/favicon.ico" ||
    path.startsWith("/_next/") ||
    path.startsWith("/static/") ||
    /\.(png|jpg|jpeg|svg|gif|ico|css|js|map|txt)$/i.test(path);

  // Allow static + auth routes
  if (isStatic || isAuthRoute) {
    if (session && path === "/login") {
      const url = req.nextUrl.clone();
      url.pathname = "/home";
      // IMPORTANT: forward cookies on redirect
      return NextResponse.redirect(url, { headers: res.headers });
    }
    return res;
  }

  // Everything else requires a session
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path + req.nextUrl.search);
    // IMPORTANT: forward cookies on redirect
    return NextResponse.redirect(url, { headers: res.headers });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
