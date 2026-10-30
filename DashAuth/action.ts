"use server";

import { signIn, signOut } from "./auth";

export async function dashboardSignIn() {
  await signIn("google", {
    redirectTo: "/dashboard",
  });
}

export async function dashboardSignOut() {
  await signOut({
    redirectTo: "/",
  });
}
