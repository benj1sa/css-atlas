"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { CheckIcon } from "lucide-react"

export default function TrafficPage() {
  const [uid, setUid] = useState("")
  const [error, setError] = useState("")
  
  // Check if UID is valid (exactly 9 digits)
  const isValidUid = uid.length === 9 && /^\d{9}$/.test(uid)

  const supabase = createClient()

  const validateUid = (): boolean => {
    if (!uid || uid.length !== 9 || !/^\d{9}$/.test(uid)) {
      setError("9 digits required")
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
          toast.success("Entry submitted successfully", {
            className: "bg-green-500 text-white border-green-600",
          });
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
          toast.success("Exit submitted successfully", {
            className: "bg-green-500 text-white border-green-600",
          });
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
            <div className="relative">
              <Input
                id="uid"
                type="text"
                value={uid}
                onChange={(e) => {
                  // Only allow digits and limit to 9 characters
                  const value = e.target.value.replace(/\D/g, "").slice(0, 9)
                  setUid(value)
                  setError("")
                }}
                placeholder="Enter UID"
                className={error ? "border-red-500" : isValidUid ? "border-green-500" : ""}
                maxLength={9}
              />
              {isValidUid && (
                <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {!error && (
              <p className={`text-sm flex items-center gap-1.5 ${
                isValidUid ? "text-green-600" : "text-muted-foreground"
              }`}>
                {isValidUid ? (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    <span>Ready</span>
                  </>
                ) : uid.length > 0 ? (
                  <span>{9 - uid.length} more</span>
                ) : (
                  <span>Enter 9 digits</span>
                )}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleEntry}
              disabled={!isValidUid}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Entry
            </Button>
            <Button
              onClick={handleExit}
              variant="destructive"
              disabled={!isValidUid}
              className="flex-1 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
