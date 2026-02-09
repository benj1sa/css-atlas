"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function TrafficPage() {
  const [uid, setUid] = useState("")
  const [error, setError] = useState("")

  const supabase = createClient()

  const validateUid = (): boolean => {
    if (!uid || uid.length !== 9 || !/^\d{9}$/.test(uid)) {
      setError("UID must be exactly 9 digits")
      return false
    }
    setError("")
    return true
  }

  const handleEntry = async () => {
    if (!validateUid()) {
      return
    }
    try {
      const { data, error } = await supabase
        .from('traffic')
        .insert([
            {
            uid: uid,
            created_at: new Date().toISOString(), 
            traffic_type: "entry", // expecting "entry" or "exit"
            },
        ])
        .select();
        if (error) {
          console.error("Error:", error);
          toast.error("Failed to submit entry");
        } else {
          console.log(data);
          toast.success("Entry submitted successfully");
          setUid("");
          setError("");
        }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Failed to submit entry");
    }
  }

  const handleExit = async () => {
    if (!validateUid()) {
      return
    }
    try {
        const { data, error } = await supabase
        .from('traffic')
        .insert([
        {
            uid: uid,
            created_at: new Date().toISOString(),
            traffic_type: "exit", // expecting "entry" or "exit"
        },
        ])
        .select()
        if (error) {
          console.error("Error:", error);
          toast.error("Failed to submit exit");
        } else {
          console.log(data);
          toast.success("Exit submitted successfully");
          setUid("");
          setError("");
        }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Failed to submit exit");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Marie Mount Hall Traffic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Input
              id="uid"
              type="text"
              value={uid}
              onChange={(e) => {
                setUid(e.target.value)
                setError("")
              }}
              placeholder="Enter UID"
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {!error && (
              <p className="text-sm text-muted-foreground">UID must be exactly 9 digits</p>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleEntry}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white hover:cursor-pointer"
            >
              Entry
            </Button>
            <Button
              onClick={handleExit}
              variant="destructive"
              className="flex-1 hover:cursor-pointer"
            >
              Exit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
