"use client";

import { dashboardSignOut } from "@/DashAuth/action";

export default function LogoutButton() {
  return (
    <button
      onClick={() => dashboardSignOut()}
      className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
    >
      Logout
    </button>
  );
}
