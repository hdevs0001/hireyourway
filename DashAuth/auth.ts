import NextAuth from "next-auth";
import NeonAdapter from "@auth/neon-adapter";
import { Pool } from "@neondatabase/serverless";
import Google from "next-auth/providers/google";
import { authCookies } from "@/lib/auth-cookies";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  return {
    basePath: "/api/dash-auth",

    adapter: NeonAdapter(pool),

    providers: [
      Google({
        authorization: {
          params: {
            prompt: "select_account",
          },
        },
      }),
    ],

    cookies: authCookies("dash-auth"),
  };
});