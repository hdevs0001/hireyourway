// lib/auth.candidate.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { authCookies } from "./auth-cookies";

declare module "next-auth" {
  interface Session {
    candidate?: {
      googleSub: string;
      email: string;
      name?: string;
      image?: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    googleSub?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],

  basePath: "/api/candidate-auth",

  // JWT strategy: no adapter here on purpose. Candidate identity is written
  // to the DB manually in complete/page.tsx once companyId/jobId are known.
  session: { strategy: "jwt" },

  // Full isolated cookie set (session, csrf, callback-url, state, pkce, nonce)
  cookies: authCookies("hireflow-candidate"),

  callbacks: {
    // On a fresh sign-in we REPLACE the whole token instead of mutating the
    // old one, so nothing from a previously used email can survive.
    async jwt({ token, account, profile }) {
      if (account && profile) {
        return {
          googleSub: profile.sub ?? undefined,
          sub: profile.sub ?? undefined,
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
        };
      }
      return token;
    },

    async session({ session, token }) {
      session.candidate = {
        googleSub: token.googleSub as string,
        email: token.email as string,
        name: token.name as string | undefined,
        image: token.picture as string | undefined,
      };
      return session;
    },
  },
});