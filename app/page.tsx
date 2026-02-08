import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center text-center max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          CSS Atlas
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          View your engagement metrics and stats in one place.
        </p>
        <p className="text-muted-foreground text-sm">
          Sign in to access your dashboard.
        </p>
        <div className="flex gap-3 flex-col sm:flex-row">
          <Button asChild size="lg">
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/auth/sign-up">Sign up</Link>
          </Button>
        </div>
      </main>
      <footer className="row-start-3 text-muted-foreground text-sm">
        <Link
          href="/auth/login"
          className="hover:underline hover:underline-offset-4"
        >
          Log in
        </Link>
        <span className="mx-2">·</span>
        <Link
          href="/auth/sign-up"
          className="hover:underline hover:underline-offset-4"
        >
          Create account
        </Link>
      </footer>
    </div>
  );
}
