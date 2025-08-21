// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  // response we'll reuse so any Set-Cookie we write is carried forward
  const res = NextResponse.next();

  const cookiesAdapter = {
    get: (name: string) => req.cookies.get(name)?.value,
    set: (name: string, value: string, options: CookieOptions) => {
      res.cookies.set({ name, value, ...options });
    },
    remove: (name: string, options: CookieOptions) => {
      res.cookies.set({ name, value: "", ...options, expires: new Date(0) });
    },
  } as any; // <-- quiet TS for now

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookiesAdapter }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;
  const isAuth = path.startsWith("/login") || path.startsWith("/auth");
  const isStatic =
    path === "/robots.txt" ||
    path === "/favicon.ico" ||
    path.startsWith("/_next/") ||
    /\.(png|jpe?g|svg|gif|ico|css|js|map|txt)$/i.test(path);

  // Allow auth + static; but if logged in and on /login, send to /home
  if (isStatic || isAuth) {
    if (session && path === "/login") {
      const to = req.nextUrl.clone();
      to.pathname = "/home";
      res.headers.set("Location", to.toString());
      return new NextResponse(null, { status: 302, headers: res.headers });
    }
    return res;
  }

  // Gate everything else
  if (!session) {
    const to = req.nextUrl.clone();
    to.pathname = "/login";
    to.searchParams.set("next", path + req.nextUrl.search);
    res.headers.set("Location", to.toString());
    return new NextResponse(null, { status: 302, headers: res.headers });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
