import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const AUTH_SECRET_FALLBACK =
  process.env.AUTH_SECRET || "tk-laptop-dev-secret-key-32-bytes-minimum-2026";

export const PUBLIC_AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export const authConfig: NextAuthConfig = {
  secret: AUTH_SECRET_FALLBACK,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        if (user.image) {
          token.picture = user.image;
        }
      }
      if (trigger === "update" && session) {
        if (typeof session.name === "string") {
          token.name = session.name;
        }
        if (typeof session.image === "string") {
          token.picture = session.image;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
        if (typeof token.picture === "string") {
          session.user.image = token.picture;
        }
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user?.id);
      const pathname = nextUrl.pathname;

      const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      );
      const isProtectedAccountRoute =
        pathname === "/account" || pathname.startsWith("/account/");

      if (isPublicAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/account", nextUrl));
      }

      if (isProtectedAccountRoute && !isLoggedIn) {
        const callbackUrl = `${pathname}${nextUrl.search}`;
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", callbackUrl);
        return NextResponse.redirect(loginUrl);
      }

      return true;
    },
  },
};
