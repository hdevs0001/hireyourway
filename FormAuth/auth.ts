import NextAuth from "next-auth";
import NeonAdapter from "@auth/neon-adapter";
import { Pool } from "@neondatabase/serverless";
import Google from "next-auth/providers/google";

// *DO NOT* create a `Pool` here, outside the request handler.

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  return {
    basePath: "/api/form-auth",

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

    cookies: {
      sessionToken: {
        name: "form-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
    },
  };
});
