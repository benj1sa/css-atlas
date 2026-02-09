"use client";

import { useState } from "react";
import {
  campusWeekToDateRange,
  dateToCampusWeek,
} from "@/lib/time";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function TimeTestClient() {
  const [weekInput, setWeekInput] = useState("18");
  const [dateInput, setDateInput] = useState(() => formatDate(new Date()));
  const [weekResult, setWeekResult] = useState<{
    week: number;
    start: string;
    end: string;
  } | null>(null);
  const [dateResult, setDateResult] = useState<number | null | "invalid">(null);

  function handleWeekSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(weekInput, 10);
    if (Number.isNaN(n) || n < 1) {
      setWeekResult(null);
      return;
    }
    const range = campusWeekToDateRange(n);
    if (range) {
      setWeekResult({
        week: range.weekNumber,
        start: formatDate(range.startDate),
        end: formatDate(range.endDate),
      });
    } else {
      setWeekResult(null);
    }
  }

  function handleDateSubmit(e: React.FormEvent) {
    e.preventDefault();
    const d = new Date(dateInput + "T12:00:00.000Z");
    if (Number.isNaN(d.getTime())) {
      setDateResult("invalid");
      return;
    }
    const week = dateToCampusWeek(d);
    setDateResult(week ?? "invalid");
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Week → Date range</CardTitle>
          <CardDescription>
            Enter a campus week number (1-based). Winter break is one week number.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleWeekSubmit} className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="week-input" className="sr-only">
                Week number
              </Label>
              <Input
                id="week-input"
                type="number"
                min={1}
                value={weekInput}
                onChange={(e) => setWeekInput(e.target.value)}
                placeholder="e.g. 18"
              />
            </div>
            <Button type="submit">Go</Button>
          </form>
          {weekResult && (
            <p className="text-sm">
              <strong>Week {weekResult.week}:</strong> {weekResult.start} (Mon) –{" "}
              {weekResult.end} (Sun)
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Date → Campus week</CardTitle>
          <CardDescription>
            Enter a date (YYYY-MM-DD). Returns the campus week number or null if
            before semester.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleDateSubmit} className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="date-input" className="sr-only">
                Date
              </Label>
              <Input
                id="date-input"
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
              />
            </div>
            <Button type="submit">Go</Button>
          </form>
          {dateResult !== null && (
            <p className="text-sm">
              {dateResult === "invalid" ? (
                <span className="text-muted-foreground">Invalid date</span>
              ) : (
                <>
                  <strong>Campus week:</strong> {dateResult}
                </>
              )}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
