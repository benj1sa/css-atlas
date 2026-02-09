import Link from "next/link";
import { requireDeveloper } from "@/lib/supabase/server";
import { DevTestClient } from "@/app/dev/dev-test-client";

export const metadata = {
  title: "Dev Tools | CSS Atlas",
  description: "Developer-only tools for testing server functions",
};

export default async function DevPage() {
  const user = await requireDeveloper();

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-12">
      <div>
        <h1 className="text-2xl font-bold">Dev Tools</h1>
        <p className="text-muted-foreground mt-1">
          Test server functions on the client. Only visible to developers.
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Logged in as: {user?.email || "No user found"}
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/dev/session-logs"
          className="text-primary hover:underline text-sm font-medium"
        >
          Session Logs Test →
        </Link>
        <Link
          href="/dev/time"
          className="text-primary hover:underline text-sm font-medium"
        >
          Campus Time Test →
        </Link>
      </div>

      <DevTestClient />
    </div>
  );
}
