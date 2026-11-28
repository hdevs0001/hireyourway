"use server";

import { auth, signIn, signOut } from "./auth";

export async function formSignIn() {
  const existing = await auth();
  if (existing) {
    await signOut({ redirect: false });
  }

  await signIn("google", {
    redirectTo: "/form",
  });
}

export async function formSignOut() {
  await signOut({
    redirectTo: "/",
  });
}