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

    events: {
      // Runs after Auth.js decides WHICH user is being signed in
      async signIn({ user, account, profile, isNewUser }) {
        console.log("[dash-auth] signIn", {
          googleReturnedEmail: profile?.email,
          dbUserEmail: user.email,
          googleSub: account?.providerAccountId,
          isNewUser,
        });
      },
      // Fires only when a Google account gets attached to an EXISTING user
      async linkAccount({ user, account, profile }) {
        console.log("[dash-auth] LINKED", {
          googleReturnedEmail: profile?.email,
          linkedToExistingUser: user.email,
          googleSub: account.providerAccountId,
        });
      },
    },
  };
});
