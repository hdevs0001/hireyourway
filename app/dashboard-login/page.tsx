import { signIn } from "@/DashAuth/auth";

export default function DashboardLoginPage() {
  return (
    <main>
      <h1>Dashboard Login Test</h1>

      <form
        action={async () => {
          "use server";

          await signIn("google", {
            redirectTo: "/dashboard-test",
          });
        }}
      >
        <button type="submit">
          Sign in to Dashboard
        </button>
      </form>
    </main>
  );
}