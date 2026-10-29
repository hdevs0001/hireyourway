import { signIn } from "@/FormAuth/auth";

export default function FormLoginPage() {
  return (
    <main>
      <h1>Form Login Test</h1>

      <form
        action={async () => {
          "use server";

          await signIn("google", {
            redirectTo: "/form-test",
          });
        }}
      >
        <button type="submit">
          Sign in to Form
        </button>
      </form>
    </main>
  );
}