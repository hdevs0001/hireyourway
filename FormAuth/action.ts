"use server";

import { signIn, signOut } from "./auth";

export async function formSignIn() {
  await signIn("google", {
    redirectTo: "/form",
  });
}

export async function formSignOut() {
  await signOut({
    redirectTo: "/",
  });
}