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
    } catch {
      isLoggedIn = false;
    }
  }

  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isProtectedAccountRoute =
    pathname === "/account" || pathname.startsWith("/account/");

  if (
    isPublicAuthRoute &&
    isLoggedIn &&
    !nextUrl.searchParams.has("sessionExpired")
  ) {
    return NextResponse.redirect(new URL("/account", nextUrl));
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
    "/account/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/:path*",
  ],
};
