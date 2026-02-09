import Link from "next/link";
import {
  FALL_SEMESTER_FIRST_DAY,
  WINTER_BREAK_FIRST_DAY,
  WINTER_BREAK_LAST_DAY,
  CAMPUS_WEEK,
  campusWeekToDateRange,
  dateToCampusWeek,
  WINTER_BREAK_CAMPUS_WEEK_NUMBER,
} from "@/lib/time";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TimeTestClient } from "./time-test-client";

export const metadata = {
  title: "Campus Time Test | Dev Tools",
  description: "Test campus week ↔ date conversion (Monday-based, winter break = one week)",
};

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function TimeTestPage() {
  const sampleWeeks = [1, WINTER_BREAK_CAMPUS_WEEK_NUMBER, WINTER_BREAK_CAMPUS_WEEK_NUMBER + 1];
  const today = new Date();
  const todayWeek = dateToCampusWeek(today);

  return (
    <div className="container mx-auto max-w-4xl space-y-8 py-12">
      <div className="flex items-center gap-4">
        <Link
          href="/dev"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Dev Tools
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Campus Time Test</h1>
        <p className="text-muted-foreground mt-1">
          Monday = first day of week. Winter break (4–5 calendar weeks) counts as
          one campus week. Spring weeks start the first Monday after break.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Config (lib/time/config.ts)</CardTitle>
          <CardDescription>
            Update these each year. Only this file needs to change.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 font-mono text-sm">
          <p>
            <span className="text-muted-foreground">FALL_SEMESTER_FIRST_DAY</span>{" "}
            = {FALL_SEMESTER_FIRST_DAY}
          </p>
          <p>
            <span className="text-muted-foreground">WINTER_BREAK_FIRST_DAY</span>{" "}
            = {WINTER_BREAK_FIRST_DAY}
          </p>
          <p>
            <span className="text-muted-foreground">WINTER_BREAK_LAST_DAY</span>{" "}
            = {WINTER_BREAK_LAST_DAY}
          </p>
          <p className="pt-2">
            <span className="text-muted-foreground">Week 1 Monday</span> ={" "}
            {formatDate(CAMPUS_WEEK.WEEK_1_MONDAY)}
          </p>
          <p>
            <span className="text-muted-foreground">Winter break week #</span> ={" "}
            <Badge variant="secondary">{WINTER_BREAK_CAMPUS_WEEK_NUMBER}</Badge>
          </p>
          <p>
            <span className="text-muted-foreground">First spring Monday</span> ={" "}
            {formatDate(CAMPUS_WEEK.FIRST_SPRING_MONDAY)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample: week → date range</CardTitle>
          <CardDescription>
            Precomputed for week 1, winter break week, and first spring week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 font-mono text-sm">
            {sampleWeeks.map((n) => {
              const range = campusWeekToDateRange(n);
              if (!range) return null;
              const label =
                n === 1
                  ? "Week 1 (first fall)"
                  : n === WINTER_BREAK_CAMPUS_WEEK_NUMBER
                    ? `Week ${n} (winter break)`
                    : `Week ${n} (first spring)`;
              return (
                <li key={n}>
                  <strong>{label}:</strong> {formatDate(range.startDate)} –
                  {formatDate(range.endDate)}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
          <CardDescription>Current date in campus week terms.</CardDescription>
        </CardHeader>
        <CardContent className="font-mono text-sm">
          <p>
            {formatDate(today)} → campus week{" "}
            {todayWeek !== null ? (
              <Badge variant="secondary">{todayWeek}</Badge>
            ) : (
              <span className="text-muted-foreground">(before semester)</span>
            )}
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Try it</h2>
        <TimeTestClient />
      </div>
    </div>
  );
}
