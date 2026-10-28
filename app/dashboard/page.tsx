import { auth } from "../../DashAuth/auth";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import LogoutButton from "../components/landingpage/logout";

async function DashboardContent() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div>
      <h1>This is the Dashboard</h1>

      {session.user.image && (
        <img
          src={session.user.image}
          alt="User profile"
          width={100}
          height={100}
        />
      )}

      <h2>Welcome, {session.user.name ?? "User"}</h2>
      <p>Email: {session.user.email ?? "Not available"}</p>
      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading dashboard...</p>}>
      <DashboardContent />
    </Suspense>
  );
}
