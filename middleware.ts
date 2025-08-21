import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isAuth = path.startsWith("/login") || path.startsWith("/auth");
  const isStatic =
    path === "/robots.txt" ||
    path === "/favicon.ico" ||
    path.startsWith("/_next/") ||
    /\.(png|jpe?g|svg|gif|ico|css|js|map|txt)$/i.test(path);

  if (isStatic || isAuth) return NextResponse.next();

  const to = req.nextUrl.clone();
  to.pathname = "/login";
  to.searchParams.set("next", path + req.nextUrl.search);
  return NextResponse.redirect(to);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
