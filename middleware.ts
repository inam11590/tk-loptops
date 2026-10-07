import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "@auth/core/jwt";
import { AUTH_SECRET_FALLBACK, PUBLIC_AUTH_ROUTES } from "@/auth.config";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  const hasSessionCookie =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token");

  let isLoggedIn = false;
  let userRole: string = "customer";

  if (hasSessionCookie) {
    try {
      const secureToken = await getToken({
        req: request,
        secret: AUTH_SECRET_FALLBACK,
        secureCookie: true,
      });
      const devToken =
        secureToken ??
        (await getToken({
          req: request,
          secret: AUTH_SECRET_FALLBACK,
          secureCookie: false,
        }));
      isLoggedIn = Boolean(devToken?.sub);
      if (typeof devToken?.role === "string") {
        userRole = devToken.role;
      }
    } catch {
      isLoggedIn = false;
    }
  }

  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isProtectedAccountRoute =
    pathname === "/account" || pathname.startsWith("/account/");
  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApiRoute =
    pathname === "/api/admin" || pathname.startsWith("/api/admin/");

  if (
    isPublicAuthRoute &&
    isLoggedIn &&
    !nextUrl.searchParams.has("sessionExpired")
  ) {
    return NextResponse.redirect(
      new URL(userRole === "admin" ? "/admin" : "/account", nextUrl)
    );
  }

  if (isAdminApiRoute) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required." },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      const callbackUrl = `${pathname}${nextUrl.search}`;
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", callbackUrl);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== "admin") {
      return NextResponse.rewrite(new URL("/forbidden", nextUrl), {
        status: 403,
      });
    }
    return NextResponse.next();
  }

  if (isProtectedAccountRoute && !isLoggedIn) {
    const callbackUrl = `${pathname}${nextUrl.search}`;
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/admin",
    "/api/admin/:path*",
    "/account/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/:path*",
  ],
};
