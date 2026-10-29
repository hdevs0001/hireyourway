
import { auth } from "@/DashAuth/auth";

export default async function DashboardTestPage() {
  const session = await auth();

  if (!session?.user) {
    return <main>Please sign in to access the dashboard.</main>;
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.name ?? session.user.email}!</p>
    </main>
  );
}
