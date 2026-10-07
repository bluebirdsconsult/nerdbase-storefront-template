import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        loginData: { label: "Login Data", type: "hidden" },
      },
      async authorize(credentials) {
        if (!credentials?.loginData) return null;
        try {
          const loginResponse = JSON.parse(credentials.loginData as string);
          const { decodeJwt } = await import("jose");
          const payload = decodeJwt(loginResponse.access_token);
          return {
            id: payload.customer_id as string,
            email: payload.email as string,
            name:
              `${payload.first_name || ""} ${payload.last_name || ""}`.trim() ||
              (payload.email as string),
            accessToken: loginResponse.access_token,
            refreshToken: loginResponse.refresh_token,
            accessTokenExp: payload.exp as number,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }): Promise<JWT | null> {
      if (user) {
        token.id = user.id;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.accessTokenExp = (user as any).accessTokenExp;
        token.accessTokenIat = Math.floor(Date.now() / 1000);
      }

      // Auto-refresh when expiring within 5 minutes
      if (token.accessTokenExp && token.refreshToken) {
        const now = Date.now();
        const timeUntilExpiry = (token.accessTokenExp as number) * 1000 - now;
        const timeSinceRefresh = now - (token.accessTokenIat as number) * 1000;

        if (timeUntilExpiry < 0) {
          token.error = "TokenExpired";
          return token;
        }

        if (timeUntilExpiry < 5 * 60 * 1000 && timeSinceRefresh > 60 * 1000) {
          try {
            const res = await fetch(
              `${process.env.CUSTOMER_AUTH_API_URL}/customer-auth/refresh`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: token.refreshToken }),
              }
            );
            if (!res.ok) {
              token.error = "RefreshTokenExpired";
              return token;
            }
            const data = await res.json();
            const { decodeJwt } = await import("jose");
            const newPayload = decodeJwt(data.access_token);
            token.accessToken = data.access_token;
            token.refreshToken = data.refresh_token;
            token.accessTokenExp = newPayload.exp as number;
            token.accessTokenIat = Math.floor(Date.now() / 1000);
            delete token.error;
          } catch {
            token.error = "RefreshTokenError";
            return token;
          }
        }
      }

      return token;
    },

    async session({ session, token }): Promise<Session> {
      if (token.error) throw new Error(token.error as string);
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).token = token.accessToken as string;
      }
      return session;
    },
  },

  trustHost: true,
});
