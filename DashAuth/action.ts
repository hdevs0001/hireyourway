"use server";

import { auth, signIn, signOut } from "./auth";

export async function dashboardSignIn() {
  // If an old session still exists, Auth.js treats the new Google login as
  // "already signed in" and LINKS the new Google account to the old user.
  // Clear it first so every sign-in starts clean.
  const existing = await auth();
  if (existing) {
    await signOut({ redirect: false });
  }

  await signIn("google", {
    redirectTo: "/dashboard",
  });
}

export async function dashboardSignOut() {
  await signOut({
    redirectTo: "/",
  });
}