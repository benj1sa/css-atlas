"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Client component for testing server functions.
 * Add buttons/forms here to call your server actions or API routes.
 */
export function DevTestClient() {
  const [status, setStatus] = useState<string>("Ready");

  const handleTestClick = async () => {
    setStatus("Testing...");
    try {
      // Example: call a server action or fetch an API route
      const res = await fetch("/api/dev/test");
      const data = await res.json().catch(() => ({}));
      setStatus(res.ok ? `OK: ${JSON.stringify(data)}` : `Error: ${res.status}`);
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Function Tester</CardTitle>
        <CardDescription>
          Use this area to test server actions and API routes from the client.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button onClick={handleTestClick} variant="outline">
            Test /api/dev/test
          </Button>
          <span className="text-muted-foreground text-sm">{status}</span>
        </div>
        <p className="text-muted-foreground text-xs">
          Add more test buttons above. Create API routes in app/api/dev/ and protect them with developer checks.
        </p>
      </CardContent>
    </Card>
  );
}
