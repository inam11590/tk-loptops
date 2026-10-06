import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "@/auth.config";
import { linkGuestOrdersToUser } from "@/lib/orders";
import {
  clearLoginAttempts,
  createUser,
  getLoginLockoutStatus,
  getUserByEmail,
  recordFailedLoginAttempt,
  verifyUserPassword,
} from "@/lib/users";
import { loginSchema } from "@/lib/validations/auth";

export class AccountLockedSigninError extends CredentialsSignin {
  code = "account_locked";
}

export class InvalidCredentialsSigninError extends CredentialsSignin {
  code = "invalid_credentials";
}

export const isGoogleAuthEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID &&
    process.env.AUTH_GOOGLE_ID.trim().length > 0 &&
    process.env.AUTH_GOOGLE_SECRET &&
    process.env.AUTH_GOOGLE_SECRET.trim().length > 0
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email ?? "",
          password: credentials?.password ?? "",
          rememberMe: false,
        });

        if (!parsed.success) {
          throw new InvalidCredentialsSigninError();
        }

        const { email, password } = parsed.data;
        const lockout = getLoginLockoutStatus(email);
        if (lockout.locked) {
          throw new AccountLockedSigninError();
        }

        const user = getUserByEmail(email);
        if (!user) {
          const attempt = recordFailedLoginAttempt(email);
          if (attempt.locked) {
            throw new AccountLockedSigninError();
          }
          throw new InvalidCredentialsSigninError();
        }

        const isValid = await verifyUserPassword(user, password);
        if (!isValid) {
          const attempt = recordFailedLoginAttempt(email);
          if (attempt.locked) {
            throw new AccountLockedSigninError();
          }
          throw new InvalidCredentialsSigninError();
        }

        clearLoginAttempts(user.email);
        linkGuestOrdersToUser(user.email, user.id);

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
        };
      },
    }),
    ...(isGoogleAuthEnabled
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        let existing = getUserByEmail(user.email);
        if (!existing) {
          const created = await createUser({
            fullName: user.name || user.email.split("@")[0] || "TK Customer",
            email: user.email,
            avatarUrl: user.image ?? "",
            provider: "google",
          });
          user.id = created.id;
          linkGuestOrdersToUser(created.email, created.id);
        } else {
          user.id = existing.id;
          user.name = existing.fullName;
          linkGuestOrdersToUser(existing.email, existing.id);
        }
      }
      return true;
    },
  },
});
