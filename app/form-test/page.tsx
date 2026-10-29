import { auth } from "@/FormAuth/auth";

export default async function FormTestPage() {
  const session = await auth();

  if (!session?.user) {
    return <main>Please sign in to access the form page.</main>;
  }

  return (
    <main>
      <h1>Form Authentication Test</h1>
      <p>Welcome, {session.user.name ?? session.user.email}!</p>
      <p>Form authentication is working.</p>
    </main>
  );
}
