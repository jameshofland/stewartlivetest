// ...same imports and setup...

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
  
    const cookiesAdapter = {
      get: (name: string) => req.cookies.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        res.cookies.set({ name, value, ...options });
      },
      remove: (name: string, options: CookieOptions) => {
        res.cookies.set({ name, value: "", ...options, expires: new Date(0) });
      },
    };
  
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookiesAdapter }
    );
  
    const { data: { session } } = await supabase.auth.getSession();
  
    const path = req.nextUrl.pathname;
    const isAuth = path.startsWith("/login") || path.startsWith("/auth");
    const isStatic =
      path === "/robots.txt" ||
      path === "/favicon.ico" ||
      path.startsWith("/_next/") ||
      /\.(png|jpg|jpeg|svg|gif|ico|css|js|map|txt)$/i.test(path);
  
    if (isStatic || isAuth) {
      if (session && path === "/login") {
        const to = req.nextUrl.clone();
        to.pathname = "/home";
        // build a redirect from the response that already has Set-Cookie
        res.headers.set("Location", to.toString());
        return new NextResponse(null, { status: 302, headers: res.headers });
      }
      return res;
    }
  
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
  