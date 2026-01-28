import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("pcos_token")?.value;

  const protectedRoutes = ["/assess", "/results", "/history", "/dashboard", "/profile"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/assess/:path*", "/results/:path*", "/history/:path*", "/dashboard/:path*", "/profile/:path*"],
};
