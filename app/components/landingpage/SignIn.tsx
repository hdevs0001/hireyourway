"use client";

import { dashboardSignIn } from "@/DashAuth/action";

export default function SignIn() {
  return (
    <button
      onClick={() => dashboardSignIn()}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Sign In with Google
    </button>
  );
}
