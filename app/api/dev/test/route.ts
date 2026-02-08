import { getDeveloperUser } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Example dev API route. Only accessible to users with developer access.
 */
export async function GET() {
  const user = await getDeveloperUser();
  if (!user) {
    return NextResponse.json(
      { error: "Forbidden: Developer access required" },
      { status: 403 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Developer API test successful",
    user: user.email,
    timestamp: new Date().toISOString(),
  });
}
