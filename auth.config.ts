import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import type { UserRole } from "@/types/next-auth";

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
        token.role = user.role === "admin" ? "admin" : "customer";
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
        if (session.role === "admin" || session.role === "customer") {
          token.role = session.role;
        }
      }
      if (!token.role) {
        token.role = "customer";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (
          token.role === "admin" ? "admin" : "customer"
        ) as UserRole;
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
      const isAdmin = auth?.user?.role === "admin";
      const pathname = nextUrl.pathname;

      const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      );
      const isProtectedAccountRoute =
        pathname === "/account" || pathname.startsWith("/account/");
      const isAdminRoute =
        pathname === "/admin" || pathname.startsWith("/admin/");
      const isAdminApiRoute =
        pathname === "/api/admin" || pathname.startsWith("/api/admin/");

      if (isPublicAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/account", nextUrl));
      }

      if ((isProtectedAccountRoute || isAdminRoute) && !isLoggedIn) {
        const callbackUrl = `${pathname}${nextUrl.search}`;
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", callbackUrl);
        return NextResponse.redirect(loginUrl);
      }

      if (isAdminApiRoute && !isLoggedIn) {
        return NextResponse.json(
          { error: "Authentication required." },
          { status: 401 }
        );
      }

      if (isAdminApiRoute && !isAdmin) {
        return NextResponse.json(
          { error: "Forbidden: Administrator access required." },
          { status: 403 }
        );
      }

      if (isAdminRoute && !isAdmin) {
        return NextResponse.rewrite(new URL("/forbidden", nextUrl), {
          status: 403,
        });
      }

      return true;
    },
  },
};
